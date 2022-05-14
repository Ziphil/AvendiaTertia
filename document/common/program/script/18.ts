/// <reference path="../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {
  Instance as PopperInstance,
  createPopper
} from "@popperjs/core";
import axios from "axios";
import localforage from "localforage";
import {
  Dictionary,
  MarkupResolver,
  NormalParameter,
  ParsedWord,
  Parser,
  Word
} from "soxsot";
import {
  BaseExecutor
} from "./module/executor";


export class Executor extends BaseExecutor {

  private dictionary?: Dictionary;
  private popper!: PopperInstance;
  private contentElement!: HTMLDivElement;

  protected prepare(): void {
    let locationSupported = location.pathname.match(/^\/conlang\/.+\/\d+(\.html)?$/);
    let deviceSupported = !navigator.userAgent.match(/iPhone|Android.+Mobile/);
    console.log(location.pathname, locationSupported, deviceSupported);
    if (locationSupported && deviceSupported) {
      this.storeDictionary();
      this.prepareButtons();
    }
  }

  private prepareButtons(): void {
    let informationElement = document.getElementById("template-information");
    let enableButtonElement = document.getElementById("template-enable-popup");
    let downloadButtonElement = document.getElementById("template-download-dictionary");
    informationElement.style.display = "block";
    enableButtonElement.addEventListener("click", (event) => {
      this.appendPopup();
      this.prepareElements();
    }, {once: true});
    downloadButtonElement.addEventListener("click", (event) => {
      this.downloadDictionary();
    });
  }

  private appendPopup(): void {
    let popupElement = document.createElement("div");
    let contentElement = document.createElement("div");
    let arrowElement = document.createElement("div");
    popupElement.classList.add("popup");
    contentElement.classList.add("popup-content");
    arrowElement.classList.add("popup-arrow");
    arrowElement.setAttribute("data-popper-arrow", "data-popper-arrow");
    popupElement.append(contentElement, arrowElement);
    document.body.append(popupElement);
    this.popper = createPopper(document.documentElement, popupElement, {placement: "top", modifiers: [
      {name: "offset", options: {offset: [0, 5]}}
    ]});
    this.contentElement = contentElement;
  }

  private prepareElements(): void {
    let resolver = Executor.createMarkupResolver();
    let parser = new Parser(resolver);
    let elements = document.getElementsByClassName("word");
    for (let i = 0 ; i < elements.length ; i ++) {
      let element = elements.item(i) as HTMLElement;
      element.addEventListener("mouseover", (event) => {
        let name = element.getAttribute("data-name");
        let word = this.searchWord(name);
        if (word !== null) {
          let parsedWord = parser.parse(word);
          let html = Executor.createWordHtml(parsedWord);
          if (html !== null) {
            this.contentElement.innerHTML = html;
            this.popper.state.elements.reference = element;
            this.popper.update();
          }
        }
      });
      element.addEventListener("mouseleave", (event) => {
        this.popper.state.elements.reference = document.documentElement;
        this.popper.update();
      });
    }
  }

  private searchWord(name: string): Word | null {
    let dictionary = this.dictionary;
    if (dictionary !== undefined) {
      let parameter = new NormalParameter(name, "name", "exact", "ja", {diacritic: false, case: false});
      let result = dictionary.search(parameter);
      let word = result.words[0];
      if (word) {
        return word;
      } else {
        if (result.suggestions.length > 0 && result.suggestions[0].kind !== "revision") {
          let suggestion = result.suggestions[0];
          let suggestedParameter = new NormalParameter(suggestion.names[0], "name", "exact", "ja", {diacritic: false, case: false});
          let suggestedResult = dictionary.search(suggestedParameter);
          let suggestedWord = suggestedResult.words[0];
          if (suggestedWord) {
            return suggestedWord;
          } else {
            return null;
          }
        } else {
          return null;
        }
      }
    }
  }

  private async storeDictionary(): Promise<void> {
    let plainDictionary = await localforage.getItem<any>("dictionary");
    if (plainDictionary) {
      this.dictionary = Dictionary.fromPlain(plainDictionary);
      console.log(`dictionary fetched, ${this.dictionary.words.length} words`);
    } else {
      console.log("dictionary not found");
    }
  }

  private async downloadDictionary(): Promise<void> {
    let plainDictionary = await axios.get("https://dic.ziphil.com/api/dictionary/fetch").then((response) => response.data);
    await localforage.setItem("dictionary", plainDictionary);
    this.dictionary = Dictionary.fromPlain(plainDictionary);
    console.log(`dictionary updated, ${this.dictionary.words.length} words`);
  }

  private static createWordHtml(word: ParsedWord<string>): string | null {
    let section = word.parts["ja"]?.sections[0];
    if (section !== undefined) {
      let html = "";
      let equivalents = section.getEquivalents(true);
      let informations = section.getNormalInformations(true).filter((information) => information.kind === "meaning" || information.kind === "usage");
      html += `<div class="popup-head"><span class="sans">${word.name}</span></div>`;
      html += `<div class="popup-section-item">`;
      for (let equivalent of equivalents) {
        html += `<div class="equivalent text list-item">`;
        if (equivalent.category) {
          html += `<span class="popup-tag popup-right-margin">${equivalent.category}</span>`;
        }
        if (equivalent.frame) {
          html += `<span class="popup-small popup-right-margin">(${equivalent.frame})</span>`;
        }
        html += equivalent.names.join(", ");
        html += `</div>`;
      }
      html += `</div>`;
      for (let information of informations) {
        html += `<div class="popup-section-item">`;
        html += `<span class="popup-small-head">${information.getKindName("ja")}</span>`;
        html += `<span class="">${information.text}</span>`;
        html += `</div>`;
      }
      return html;
    } else {
      return null;
    }
  }

  private static createMarkupResolver(): MarkupResolver<string, string> {
    let resolver = new MarkupResolver<string, string>({
      resolveLink: (name, children) => children.join(""),
      resolveBracket: (children) => `<span class="sans">${children.join("")}</span>`,
      resolveSlash: (string) => `<span class="italic">${string}</span>`,
      join: (nodes) => nodes.join("")
    });
    return resolver;
  }

}


Executor.regsiter();
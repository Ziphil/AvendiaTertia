/// <reference path="../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {Instance as PopperInstance, createPopper} from "@popperjs/core";
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
import {BaseExecutor} from "./module/executor";


export class Executor extends BaseExecutor {

  private dictionary?: Dictionary;
  private popper!: PopperInstance;
  private popupElement!: HTMLDivElement;
  private contentElement!: HTMLDivElement;

  protected prepare(): void {
    const locationSupported = location.pathname.match(/^\/shaleian\/.+\/\d+(\.html)?$/);
    const deviceSupported = !navigator.userAgent.match(/iPhone|Android.+Mobile/);
    console.log(location.pathname, locationSupported, deviceSupported);
    if (locationSupported && deviceSupported) {
      this.storeDictionary();
      this.prepareButtons();
    }
  }

  private prepareButtons(): void {
    const informationElement = document.getElementById("template-information")!;
    const enableButtonElement = document.getElementById("template-enable-popup")!;
    const downloadButtonElement = document.getElementById("template-download-dictionary")!;
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
    const popupElement = document.createElement("div");
    const contentElement = document.createElement("div");
    const arrowElement = document.createElement("div");
    popupElement.classList.add("popup");
    popupElement.setAttribute("aria-hidden", "true");
    contentElement.classList.add("popup-content");
    arrowElement.classList.add("popup-arrow");
    arrowElement.setAttribute("data-popper-arrow", "data-popper-arrow");
    popupElement.append(contentElement, arrowElement);
    document.body.append(popupElement);
    this.popper = createPopper(document.documentElement, popupElement, {
      placement: "top",
      modifiers: [{name: "offset", options: {offset: [0, 5]}}]
    });
    this.popupElement = popupElement;
    this.contentElement = contentElement;
  }

  private prepareElements(): void {
    const resolver = Executor.createMarkupResolver();
    const parser = new Parser(resolver);
    const elements = document.getElementsByClassName("word");
    for (let i = 0 ; i < elements.length ; i ++) {
      const element = elements.item(i) as HTMLElement;
      element.addEventListener("mouseover", (event) => {
        const name = element.getAttribute("data-name")!;
        const word = this.searchWord(name);
        if (word !== null) {
          const parsedWord = parser.parse(word);
          const html = Executor.createWordHtml(parsedWord);
          if (html !== null) {
            this.popupElement.setAttribute("aria-hidden", "false");
            this.contentElement.innerHTML = html;
            this.popper.state.elements.reference = element;
            this.popper.update();
          }
        }
      });
      element.addEventListener("mouseleave", (event) => {
        this.popupElement.setAttribute("aria-hidden", "true");
        this.popper.state.elements.reference = document.documentElement;
        this.popper.update();
      });
    }
  }

  private searchWord(name: string): Word | null {
    const dictionary = this.dictionary;
    if (dictionary !== undefined) {
      const parameter = new NormalParameter(name, "name", "exact", "ja", {diacritic: false, case: false, space: false, wave: false});
      const result = dictionary.search(parameter);
      const word = result.words[0];
      if (word) {
        return word;
      } else {
        if (result.suggestions.length > 0 && result.suggestions[0].kind !== "revision") {
          const suggestion = result.suggestions[0];
          const suggestedParameter = new NormalParameter(suggestion.names[0], "name", "exact", "ja", {diacritic: false, case: false, space: false, wave: false});
          const suggestedResult = dictionary.search(suggestedParameter);
          const suggestedWord = suggestedResult.words[0];
          if (suggestedWord) {
            return suggestedWord;
          } else {
            return null;
          }
        } else {
          return null;
        }
      }
    } else {
      return null;
    }
  }

  private async storeDictionary(): Promise<void> {
    const plainDictionary = await localforage.getItem<any>("dictionary");
    if (plainDictionary) {
      this.dictionary = Dictionary.fromPlain(plainDictionary);
      console.log(`dictionary fetched, ${this.dictionary.words.length} words`);
    } else {
      console.log("dictionary not found");
    }
  }

  private async downloadDictionary(): Promise<void> {
    const plainDictionary = await axios.get("https://dic.ziphil.com/api/dictionary/fetch").then((response) => response.data);
    await localforage.setItem("dictionary", plainDictionary);
    this.dictionary = Dictionary.fromPlain(plainDictionary);
    console.log(`dictionary updated, ${this.dictionary.words.length} words`);
  }

  private static createWordHtml(word: ParsedWord<string>): string | null {
    const section = word.parts["ja"]?.sections[0];
    if (section !== undefined) {
      let html = "";
      const equivalents = section.getEquivalents(true);
      const informations = section.getNormalInformations(true).filter((information) => information.kind === "meaning" || information.kind === "usage");
      html += `<div class="popup-head"><span class="sans">${word.name}</span></div>`;
      html += `<div class="popup-section-item">`;
      for (const equivalent of equivalents) {
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
      for (const information of informations) {
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
    const resolver = new MarkupResolver<string, string>({
      resolveLink: (name, children) => children.join(""),
      resolveBracket: (children) => `<span class="sans">${children.join("")}</span>`,
      resolveSlash: (string) => `<span class="italic">${string}</span>`,
      join: (nodes) => nodes.join("")
    });
    return resolver;
  }

}


Executor.register();
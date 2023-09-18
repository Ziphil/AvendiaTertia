/// <reference path="../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {
  BaseExecutor
} from "./module/executor";


const DICTIONARY_URL = "https://en.oxforddictionaries.com/definition/";
const PRONUNCIATION_REGEXP = "&lt;span class=\"phoneticspelling\"&gt;(.+)&lt;\/span&gt;";

type WordMark = 0 | 1 | null;


export class WordEntry {

  public english: string;
  public japanese: string;
  public mark: WordMark;

  public constructor(english: string, japanese: string) {
    this.english = english;
    this.japanese = japanese;
    this.mark = null;
  }

}


export class WordManager {

  public entries: Array<WordEntry>;

  public constructor() {
    this.entries = [];
  }

  public append(text: string): void {
    const splitText = text.split(/\r\n|\r|\n/);
    for (const line of splitText) {
      const match = line.match(/^\s*(.+?)\s*,\s*(.+)\s*$/m);
      if (match !== null) {
        const entry = new WordEntry(match[1], match[2]);
        this.entries.push(entry);
      }
    }
    this.shuffle();
  }

  public shuffle(): void {
    const entries = this.entries;
    for (let i = entries.length - 1 ; i > 0 ; i --) {
      const j = Math.floor(Math.random() * (i + 1));
      const temporary = entries[i];
      entries[i] = entries[j];
      entries[j] = temporary;
    }
  }

  public count(mark: WordMark): number {
    let count = 0;
    for (const entry of this.entries) {
      if (entry.mark === mark) {
        count ++;
      }
    }
    return count;
  }

  public countMarked(): number {
    let count = 0;
    for (const entry of this.entries) {
      if (entry.mark !== null) {
        count ++;
      }
    }
    return count;
  }

  public get(index: number): WordEntry | undefined {
    return this.entries[index];
  }

  public get length(): number {
    return this.entries.length;
  }

}


export class Executor extends BaseExecutor {

  private manager: WordManager;
  private request: XMLHttpRequest | null;
  private count: number;

  public constructor() {
    super();
    this.manager = new WordManager();
    this.request = null;
    this.count = 0;
  }

  protected prepare(): void {
    this.prepareDocument();
    this.prepareElements();
    this.prepareButtons();
  }

  private prepareDocument(): void {
    document.addEventListener("keydown", (event) => {
      if (event.keyCode === 39) {
        const amount = (event.shiftKey) ? 2 : 1;
        this.next(amount);
      } else if (event.keyCode === 37) {
        const amount = (event.shiftKey) ? 2 : 1;
        this.previous(amount);
      }
      if (event.keyCode === 68) {
        this.mark(0);
      } else if (event.keyCode === 65) {
        this.mark(1);
      } else if (event.keyCode === 83) {
        this.mark(null);
      }
    });
  }

  private prepareElements(): void {
    document.querySelectorAll("input[name=\"mode\"]").forEach((element) => {
      element.addEventListener("change", (event) => {
        const target = event.target as HTMLInputElement;
        const mode = parseInt(target.value);
        const arrowDiv = document.querySelector<HTMLElement>("#arrow")!;
        if (mode === 0) {
          arrowDiv.style.margin = "0px auto -5px auto";
          arrowDiv.style.borderTop = "30px hsl(240, 60%, 60%) solid";
          arrowDiv.style.borderRight = "50px transparent solid";
          arrowDiv.style.borderBottom = "30px transparent solid";
          arrowDiv.style.borderLeft = "50px transparent solid";
        } else {
          arrowDiv.style.margin = "-30px auto 25px auto";
          arrowDiv.style.borderTop = "30px transparent solid";
          arrowDiv.style.borderRight = "50px transparent solid";
          arrowDiv.style.borderBottom = "30px hsl(240, 60%, 60%) solid";
          arrowDiv.style.borderLeft = "50px transparent solid";
        }
      });
    });
    document.querySelector("#show-list")!.addEventListener("change", (event) => {
      this.toggleList();
    });
  }

  private prepareButtons(): void {
    document.querySelectorAll("[id^=\"previous-\"]").forEach((element) => {
      element.addEventListener("click", () => {
        const amount = parseInt(element.id.replace(/^previous-/, ""));
        this.previous(amount);
      });
    });
    document.querySelectorAll("[id^=\"next-\"]").forEach((element) => {
      element.addEventListener("click", () => {
        const amount = parseInt(element.id.replace(/^next-/, ""));
        this.next(amount);
      });
    });
    document.querySelectorAll("[id^=\"mark-\"]").forEach((element) => {
      element.addEventListener("click", () => {
        if (element.id === "mark-null") {
          this.mark(null);
        } else {
          const mark = parseInt(element.id.replace(/^mark-/, "")) as WordMark;
          this.mark(mark);
        }
      });
    });
    document.querySelector("#reflesh")!.addEventListener("click", () => {
      this.reflesh();
    });
    document.querySelector("#shuffle")!.addEventListener("click", () => {
      this.shuffle();
    });
    document.querySelector("#file")!.addEventListener("change", () => {
      this.upload();
    });
  }

  private upload(): void {
    const manager = new WordManager();
    const files = document.querySelector<HTMLInputElement>("#file")!.files || new FileList();
    for (const file of files) {
      const reader = new FileReader();
      reader.addEventListener("load", (event) => {
        const result = reader.result;
        if (typeof result === "string") {
          manager.append(result);
          this.updateMain(true);
          this.updateMark();
          this.createList();
        } else {
          alert("テキストデータではありません。");
        }
      });
      reader.readAsText(file);
    }
    this.manager = manager;
  }

  private createList(): void {
    const manager = this.manager;
    const table = document.querySelector("#list")!;
    table.textContent = null;
    for (let i = 0 ; i < manager.length ; i ++) {
      const entry = manager.get(i)!;
      const tr = document.createElement("tr");
      const numberTd = document.createElement("td");
      const markTd = document.createElement("td");
      const textTd = document.createElement("td");
      tr.setAttribute("id", "entry-" + i);
      numberTd.setAttribute("class", "number");
      numberTd.textContent = (i + 1).toString();
      markTd.setAttribute("class", "mark");
      textTd.setAttribute("class", "text");
      textTd.textContent = entry.english;
      tr.addEventListener("click", (event) => {
        this.jump(i * 2 + 1);
      });
      tr.append(numberTd, markTd, textTd);
      table.appendChild(tr);
    }
    for (let i = 0 ; i < manager.length ; i ++) {
      this.updateList(i);
    }
    this.updateStatistics();
  }

  private updateMain(increment: boolean): void {
    const manager = this.manager;
    const index = this.index;
    const status = (this.count + 1) % 2;
    const mode = parseInt(document.querySelector<HTMLInputElement>("input[name=\"mode\"]:checked")!.value);
    const entry = manager.get(index);
    const englishDiv = document.querySelector("#english")!;
    const japaneseDiv = document.querySelector("#japanese")!;
    const pronunciationDiv = document.querySelector("#pronunciation")!;
    if (entry) {
      if (status === 0) {
        if (mode === 0) {
          englishDiv.textContent = entry.english;
          japaneseDiv.textContent = "";
          pronunciationDiv.textContent = "　";
        } else {
          englishDiv.textContent = "";
          japaneseDiv.textContent = entry.japanese;
          pronunciationDiv.textContent = "";
        }
      } else {
        englishDiv.textContent = entry.english;
        japaneseDiv.textContent = entry.japanese;
        pronunciationDiv.textContent = "　";
      }
    } else {
      englishDiv.textContent = "";
      japaneseDiv.textContent = "";
    }
    const numeratorDiv = document.querySelector("#numerator")!;
    const denominatorDiv = document.querySelector("#denominator")!;
    numeratorDiv.textContent = (index + 1).toString();
    denominatorDiv.textContent = manager.length.toString();
  }

  private updateMark(): void {
    const manager = this.manager;
    const index = this.index;
    const entry = manager.get(index);
    const correctDiv = document.querySelector<HTMLElement>("#correct-mark")!;
    const wrongDiv = document.querySelector<HTMLElement>("#wrong-mark")!;
    if (entry) {
      const mark = entry.mark;
      if (mark === 0) {
        correctDiv.style.display = "inline";
        wrongDiv.style.display = "none";
      } else if (mark === 1) {
        correctDiv.style.display = "none";
        wrongDiv.style.display = "inline";
      } else {
        correctDiv.style.display = "none";
        wrongDiv.style.display = "none";
      }
    } else {
      correctDiv.style.display = "none";
      wrongDiv.style.display = "none";
    }
  }

  private updateList(index: number): void {
    const manager = this.manager;
    const entry = manager.get(index);
    if (entry) {
      const mark = entry.mark;
      const markTd = document.querySelector("#entry-" + index + " .mark")!;
      const textTd = document.querySelector("#entry-" + index + " .text")!;
      if (mark === 0) {
        markTd.textContent = "\uF009";
        markTd.setAttribute("class", "mark correct");
        textTd.setAttribute("class", "text correct");
      } else if (mark === 1) {
        markTd.textContent = "\uF00A";
        markTd.setAttribute("class", "mark wrong");
        textTd.setAttribute("class", "text wrong");
      } else {
        markTd.textContent = "";
        markTd.setAttribute("class", "mark");
        textTd.setAttribute("class", "text");
      }
    }
  }

  private updateStatistics(): void {
    const manager = this.manager;
    const marks = [0, 1] as Array<WordMark>;
    for (const mark of marks) {
      const numeratorDiv = document.querySelector("#statistics-" + mark + " .numerator")!;
      const denominatorDiv = document.querySelector("#statistics-" + mark + " .denominator")!;
      numeratorDiv.textContent = manager.count(mark).toString();
      denominatorDiv.textContent = manager.countMarked().toString();
    }
  }

  private previous(amount: number = 1): void {
    if (this.count > 0) {
      this.count -= amount;
      if (this.count <= 0) {
        this.count = 0;
      }
      this.updateMain(false);
      this.updateMark();
    } else {
      alert("は?");
    }
  }

  private next(amount: number = 1): void {
    if (this.count < this.manager.length * 2) {
      this.count += amount;
      if (this.count >= this.manager.length * 2) {
        this.count = this.manager.length * 2;
      }
      this.updateMain(true);
      this.updateMark();
    } else {
      alert("全ての問題が終了しました。");
    }
  }

  private jump(count: number): void {
    if (count >= 0 && count <= this.manager.length * 2) {
      this.count = count;
      this.updateMain(false);
      this.updateMark();
    } else {
      alert("は?");
    }
  }

  private shuffle(): void {
    const result = confirm("リストの順番をシャッフルしますか?");
    if (result) {
      this.count = 0;
      this.manager.shuffle();
      this.updateMain(false);
      this.updateMark();
      this.createList();
    }
  }

  private reflesh(): void {
    const result = confirm("マーカーを全て削除しますか?");
    if (result) {
      this.count = 0;
      for (const entry of this.manager.entries) {
        entry.mark = null;
      }
      this.updateMain(false);
      this.updateMark();
      this.createList();
    }
  }

  private mark(mark: WordMark): void {
    const manager = this.manager;
    const index = this.index;
    const entry = manager.get(index);
    if (entry) {
      entry.mark = mark;
      this.updateMark();
      this.updateList(index);
      this.updateStatistics();
      if (document.querySelector<HTMLInputElement>("#enable-sound")!.checked) {
        if (mark === 0) {
          document.querySelector<HTMLMediaElement>("#correct-sound")!.play();
        } else if (mark === 1) {
          document.querySelector<HTMLMediaElement>("#wrong-sound")!.play();
        }
      }
    } else {
      alert("それは無理。");
    }
  }

  private toggleList(): void {
    if (document.querySelector<HTMLInputElement>("#show-list")!.checked) {
      document.querySelectorAll(".side").forEach((element) => {
        element.classList.add("shown");
      });
    } else {
      document.querySelectorAll(".side").forEach((element) => {
        element.classList.remove("shown");
      });
    }
  }

  private fetchPronunciations(word: string, element: HTMLElement): void {
    const previousRequest = this.request;
    if (previousRequest) {
      previousRequest.abort();
    }
    const url = DICTIONARY_URL + word;
    const request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.send(null);
    request.addEventListener("readystatechange", (event) => {
      if (request.readyState === 4 && request.status === 200) {
        const html = request.responseText;
        const regexp = new RegExp(PRONUNCIATION_REGEXP, "g");
        let pronunciations = [] as Array<string>;
        let match = null as RegExpExecArray | null;
        while ((match = regexp.exec(html)) !== null) {
          pronunciations.push(match[1]);
        }
        if (pronunciations.length > 0) {
          pronunciations = pronunciations.filter((pronunciation, index, self) => {
            return self.indexOf(pronunciation) === index;
          });
          element.textContent = pronunciations.join(", ");
        } else {
          element.textContent = "?";
        }
      }
    });
    this.request = request;
  }

  private get index(): number {
    return Math.floor((this.count + 1) / 2) - 1;
  }

}


Executor.register();
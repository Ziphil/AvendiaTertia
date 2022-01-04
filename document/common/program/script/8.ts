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
    let splitText = text.split(/\r\n|\r|\n/);
    for (let line of splitText) {
      let match = line.match(/^\s*(.+?)\s*,\s*(.+)\s*$/m);
      if (match !== null) {
        let entry = new WordEntry(match[1], match[2]);
        this.entries.push(entry);
      }
    }
    this.shuffle();
  }

  public shuffle(): void {
    let entries = this.entries;
    for (let i = entries.length - 1 ; i > 0 ; i --) {
      let j = Math.floor(Math.random() * (i + 1));
      let temporary = entries[i];
      entries[i] = entries[j];
      entries[j] = temporary;
    }
  }

  public count(mark: WordMark): number {
    let count = 0;
    for (let entry of this.entries) {
      if (entry.mark === mark) {
        count ++;
      }
    }
    return count;
  }

  public countMarked(): number {
    let count = 0;
    for (let entry of this.entries) {
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
        let amount = (event.shiftKey) ? 2 : 1;
        this.next(amount);
      } else if (event.keyCode === 37) {
        let amount = (event.shiftKey) ? 2 : 1;
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
        let target = event.target as HTMLInputElement;
        let mode = parseInt(target.value);
        let arrowDiv = document.querySelector<HTMLElement>("#arrow")!;
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
        let amount = parseInt(element.id.replace(/^previous-/, ""));
        this.previous(amount);
      });
    });
    document.querySelectorAll("[id^=\"next-\"]").forEach((element) => {
      element.addEventListener("click", () => {
        let amount = parseInt(element.id.replace(/^next-/, ""));
        this.next(amount);
      });
    });
    document.querySelectorAll("[id^=\"mark-\"]").forEach((element) => {
      element.addEventListener("click", () => {
        if (element.id === "mark-null") {
          this.mark(null);
        } else {
          let mark = parseInt(element.id.replace(/^mark-/, "")) as WordMark;
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
    let manager = new WordManager();
    let files = document.querySelector<HTMLInputElement>("#file")!.files || new FileList();
    for (let file of files) {
      let reader = new FileReader();
      reader.addEventListener("load", (event) => {
        let result = reader.result;
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
    let manager = this.manager;
    let table = document.querySelector("#list")!;
    table.textContent = null;
    for (let i = 0 ; i < manager.length ; i ++) {
      let entry = manager.get(i)!;
      let tr = document.createElement("tr");
      let numberTd = document.createElement("td");
      let markTd = document.createElement("td");
      let textTd = document.createElement("td");
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
    let manager = this.manager;
    let index = this.index;
    let status = (this.count + 1) % 2;
    let mode = parseInt(document.querySelector<HTMLInputElement>("input[name=\"mode\"]:checked")!.value);
    let entry = manager.get(index);
    let englishDiv = document.querySelector("#english")!;
    let japaneseDiv = document.querySelector("#japanese")!;
    let pronunciationDiv = document.querySelector("#pronunciation")!;
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
    let numeratorDiv = document.querySelector("#numerator")!;
    let denominatorDiv = document.querySelector("#denominator")!;
    numeratorDiv.textContent = (index + 1).toString();
    denominatorDiv.textContent = manager.length.toString();
  }

  private updateMark(): void {
    let manager = this.manager;
    let index = this.index;
    let entry = manager.get(index);
    let correctDiv = document.querySelector<HTMLElement>("#correct-mark")!;
    let wrongDiv = document.querySelector<HTMLElement>("#wrong-mark")!;
    if (entry) {
      let mark = entry.mark;
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
    let manager = this.manager;
    let entry = manager.get(index);
    if (entry) {
      let mark = entry.mark;
      let markTd = document.querySelector("#entry-" + index + " .mark")!;
      let textTd = document.querySelector("#entry-" + index + " .text")!;
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
    let manager = this.manager;
    let marks = [0, 1] as Array<WordMark>;
    for (let mark of marks) {
      let numeratorDiv = document.querySelector("#statistics-" + mark + " .numerator")!;
      let denominatorDiv = document.querySelector("#statistics-" + mark + " .denominator")!;
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
    let result = confirm("リストの順番をシャッフルしますか?");
    if (result) {
      this.count = 0;
      this.manager.shuffle();
      this.updateMain(false);
      this.updateMark();
      this.createList();
    }
  }

  private reflesh(): void {
    let result = confirm("マーカーを全て削除しますか?");
    if (result) {
      this.count = 0;
      for (let entry of this.manager.entries) {
        entry.mark = null;
      }
      this.updateMain(false);
      this.updateMark();
      this.createList();
    }
  }

  private mark(mark: WordMark): void {
    let manager = this.manager;
    let index = this.index;
    let entry = manager.get(index);
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
    let previousRequest = this.request;
    if (previousRequest) {
      previousRequest.abort();
    }
    let url = DICTIONARY_URL + word;
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.send(null);
    request.addEventListener("readystatechange", (event) => {
      if (request.readyState === 4 && request.status === 200) {
        let html = request.responseText;
        let regexp = new RegExp(PRONUNCIATION_REGEXP, "g");
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


Executor.regsiter();
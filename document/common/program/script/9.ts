/// <reference path="../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {BaseExecutor} from "./module/executor";


const RADIX = 16;
const HIGHLIGHT_COLOR = "hsl(240, 60%, 60%)";
const HIGHLIGHT_BACKGROUND_COLOR = "hsl(240, 100%, 98%)";

type Status = 0 | 1;


export class Executor extends BaseExecutor {

  private status: Status;
  private previousInput: {left: string, right: string};

  public constructor() {
    super();
    this.status = 0;
    this.previousInput = {left: "", right: ""};
  }

  protected prepare(): void {
    this.prepareInitial();
    this.prepareElements();
    this.createTable();
  }

  private prepareInitial(): void {
    this.previousInput.left = document.querySelector<HTMLInputElement>("#left")!.value;
    this.previousInput.right = document.querySelector<HTMLInputElement>("#right")!.value;
  }

  private prepareElements(): void {
    document.querySelectorAll("input[name=\"left-mode\"]").forEach((element) => {
      element.addEventListener("change", (event) => {
        this.createTable();
      });
    });
    document.querySelectorAll("input[name=\"right-mode\"]").forEach((element) => {
      element.addEventListener("change", (event) => {
        this.createTable();
      });
    });
    document.querySelector("#left")!.addEventListener("input", (event) => {
      const target = event.target as HTMLInputElement;
      this.validateInput(target, "left");
    });
    document.querySelector("#right")!.addEventListener("input", (event) => {
      const target = event.target as HTMLInputElement;
      this.validateInput(target, "right");
    });
    document.querySelector("#left")!.addEventListener("paste", (event) => {
      event.preventDefault();
    });
    document.querySelector("#right")!.addEventListener("paste", (event) => {
      event.preventDefault();
    });
    document.querySelector("#operator")!.addEventListener("click", (event) => {
      this.changeOperator();
    });
    document.querySelector("#equal")!.addEventListener("click", (event) => {
      this.next();
    });
    document.querySelector("#show")!.addEventListener("click", (event) => {
      this.toggleTable();
    });
  }

  private changeOperator(): void {
    const operatorButton = document.querySelector<HTMLInputElement>("#operator")!;
    if (operatorButton.value === "+") {
      operatorButton.value = "×";
    } else {
      operatorButton.value = "+";
    }
    if (this.status === 1) {
      this.updateAnswer();
    }
    this.createTable();
  }

  private toggleTable(): void {
    const tableContainer = document.querySelector<HTMLElement>("#table-container")!;
    const showButton = document.querySelector<HTMLElement>("#show")!;
    if (tableContainer.style.display === "none") {
      tableContainer.style.display = "block";
      showButton.textContent = "Hide Table";
    } else {
      tableContainer.style.display = "none";
      showButton.textContent = "Show Table";
    }
  }

  private validateInput(source: HTMLInputElement, position: "left" | "right"): void {
    const input = source.value.toUpperCase().slice(-1);
    const maxAlphabet = (RADIX - 1).toString(RADIX).toUpperCase();
    const correctRegexp = new RegExp("^[1-9A-" + maxAlphabet + "]{0,1}$");
    if (input.match(correctRegexp)) {
      source.value = input;
      this.previousInput[position] = input;
    } else {
      source.value = this.previousInput[position];
    }
    if (this.status === 1) {
      this.updateAnswer();
    }
    this.createTable();
  }

  private next(): void {
    if (this.status === 0) {
      this.updateAnswer();
      this.status = 1;
    } else {
      this.incrementProblem();
      this.status = 0;
    }
  }

  private updateAnswer(): void {
    const leftElement = document.querySelector<HTMLInputElement>("#left")!;
    const rightElement = document.querySelector<HTMLInputElement>("#right")!;
    const answerElement = document.querySelector<HTMLInputElement>("#answer")!;
    const operatorButton = document.querySelector<HTMLInputElement>("#operator")!;
    const left = parseInt(leftElement.value, RADIX) || 1;
    const right = parseInt(rightElement.value, RADIX) || 1;
    const answer = (operatorButton.value === "+") ? left + right : left * right;
    answerElement.textContent = answer.toString(RADIX).toUpperCase();
  }

  private incrementProblem(): void {
    const leftElement = document.querySelector<HTMLInputElement>("#left")!;
    const rightElement = document.querySelector<HTMLInputElement>("#right")!;
    const answerElement = document.querySelector<HTMLInputElement>("#answer")!;
    const left = parseInt(leftElement.value, RADIX) || 1;
    const right = parseInt(rightElement.value, RADIX) || 1;
    let nextLeft = left;
    let nextRight = right;
    const leftMode = parseInt(document.querySelector<HTMLInputElement>("input[name=\"left-mode\"]:checked")!.value);
    const rightMode = parseInt(document.querySelector<HTMLInputElement>("input[name=\"right-mode\"]:checked")!.value);
    if (leftMode === 0) {
      nextLeft = left + 1;
      if (nextLeft > RADIX - 1) {
        nextLeft = 1;
      }
    } else if (leftMode === 1) {
      nextLeft = left - 1;
      if (nextLeft < 1) {
        nextLeft = RADIX - 1;
      }
    } else if (leftMode === 2) {
      while (nextLeft === left) {
        nextLeft = Math.floor(Math.random() * (RADIX - 1)) + 1;
      }
    }
    if (rightMode === 0) {
      nextRight = right + 1;
      if (nextRight > RADIX - 1) {
        nextRight = 1;
      }
    } else if (rightMode === 1) {
      nextRight = right - 1;
      if (nextRight < 1) {
        nextRight = RADIX - 1;
      }
    } else if (rightMode === 2) {
      while (nextRight === right) {
        nextRight = Math.floor(Math.random() * (RADIX - 1)) + 1;
      }
    }
    leftElement.value = nextLeft.toString(RADIX).toUpperCase();
    rightElement.value = nextRight.toString(RADIX).toUpperCase();
    answerElement.textContent = "";
    this.previousInput.left = leftElement.value;
    this.previousInput.right = rightElement.value;
  }

  private createTable(): void {
    const leftElement = document.querySelector<HTMLInputElement>("#left")!;
    const rightElement = document.querySelector<HTMLInputElement>("#right")!;
    const operatorButton = document.querySelector<HTMLInputElement>("#operator")!;
    const left = parseInt(leftElement.value, RADIX) || 1;
    const right = parseInt(rightElement.value, RADIX) || 1;
    const leftMode = parseInt(document.querySelector<HTMLInputElement>("input[name=\"left-mode\"]:checked")!.value);
    const rightMode = parseInt(document.querySelector<HTMLInputElement>("input[name=\"right-mode\"]:checked")!.value);
    const table = document.querySelector("#table")!;
    table.textContent = null;
    for (let i = 0 ; i <= RADIX - 1 ; i ++) {
      const tr = document.createElement("tr");
      for (let j = 0 ; j <= RADIX - 1 ; j ++) {
        const td = (i >= 1 && j >= 1) ? document.createElement("td") : document.createElement("th");
        if (i === 0 && j === 0) {
          td.textContent = operatorButton.value;
        } else if (i === 0) {
          td.textContent = j.toString(RADIX).toUpperCase();
        } else if (j === 0) {
          td.textContent = i.toString(RADIX).toUpperCase();
        } else {
          const answer = (operatorButton.value === "+") ? i + j : i * j;
          td.textContent = answer.toString(RADIX).toUpperCase();
        }
        if (i === 0 && j !== 0) {
          td.addEventListener("click", (event) => {
            rightElement.value = td.textContent || "";
            if (this.status === 1) {
              this.updateAnswer();
            }
            this.createTable();
          });
        } else if (j === 0 && i !== 0) {
          td.addEventListener("click", (event) => {
            leftElement.value = td.textContent || "";
            if (this.status === 1) {
              this.updateAnswer();
            }
            this.createTable();
          });
        }
        if (leftMode === 3) {
          if ((rightMode !== 3 || (rightMode === 3 && j === right)) && i === left - 1) {
            td.style.borderBottom = "1px " + HIGHLIGHT_COLOR + " solid";
          } else if ((rightMode !== 3 || (rightMode === 3 && j === right)) && i === left) {
            td.style.borderBottom = "1px " + HIGHLIGHT_COLOR + " solid";
            td.style.fontWeight = "bold";
            td.style.color = HIGHLIGHT_COLOR;
            td.style.backgroundColor = HIGHLIGHT_BACKGROUND_COLOR;
            if (j === 0) {
              td.style.borderRight = "1px " + HIGHLIGHT_COLOR + " solid";
              td.style.color = "white";
              td.style.backgroundColor = HIGHLIGHT_COLOR;
            }
          }
          if (rightMode !== 3 && i === left && j === RADIX - 1) {
            td.style.borderRight = "1px " + HIGHLIGHT_COLOR + " solid";
          }
        }
        if (rightMode === 3) {
          if ((leftMode !== 3 || (leftMode === 3 && i === left)) && j === right - 1) {
            td.style.borderRight = "1px " + HIGHLIGHT_COLOR + " solid";
          } else if ((leftMode !== 3 || (leftMode === 3 && i === left)) && j === right) {
            td.style.borderRight = "1px " + HIGHLIGHT_COLOR + " solid";
            td.style.fontWeight = "bold";
            td.style.color = HIGHLIGHT_COLOR;
            td.style.backgroundColor = HIGHLIGHT_BACKGROUND_COLOR;
            if (i === 0) {
              td.style.borderBottom = "1px " + HIGHLIGHT_COLOR + " solid";
              td.style.color = "white";
              td.style.backgroundColor = HIGHLIGHT_COLOR;
            }
          }
          if (leftMode !== 3 && j === right && i === RADIX - 1) {
            td.style.borderBottom = "1px " + HIGHLIGHT_COLOR + " solid";
          }
        }
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
  }

}


Executor.register();
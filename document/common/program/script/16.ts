/// <reference path="../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {
  BaseExecutor
} from "./module/executor";


export class Executor extends BaseExecutor {

  protected prepare(): void {
    let trElements = Array.from(document.querySelectorAll("table.translation tr")) as Array<HTMLElement>;
    let hiddenTrElements = trElements.slice(-3);
    let lastTrElement = trElements.slice(-4)[0];
    for (let hiddenTrElement of hiddenTrElements) {
      hiddenTrElement.style.display = "none";
    }
    let maskElements = [] as Array<HTMLElement>;
    for (let rawLastTdElement of lastTrElement.children) {
      let lastTdElement = rawLastTdElement as HTMLElement;
      let maskElement = document.createElement("tr");
      maskElement.style.top = "-20px";
      maskElement.style.bottom = "0px";
      maskElement.style.left = "-1px";
      maskElement.style.right = "-1px";
      maskElement.style.background = "linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 70%)";
      maskElement.style.position = "absolute";
      maskElement.style.cursor = "pointer";
      maskElement.addEventListener("click", () => {
        for (let lastTrElement of hiddenTrElements) {
          lastTrElement.style.display = "table-row";
        }
        for (let maskElement of maskElements) {
          maskElement.remove();
        }
      });
      lastTdElement.style.position = "relative";
      lastTdElement.append(maskElement);
      maskElements.push(maskElement);
    }
  }

}


Executor.regsiter();
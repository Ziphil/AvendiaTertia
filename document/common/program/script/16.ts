/// <reference path="../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {
  BaseExecutor
} from "./module/executor";


export class Executor extends BaseExecutor {

  protected prepare(): void {
    const trElements = Array.from(document.querySelectorAll("table.translation tr"));
    const hiddenTrElements = trElements.slice(-3) as Array<HTMLTableRowElement>;
    const lastTrElement = trElements.slice(-4)[0];
    for (const hiddenTrElement of hiddenTrElements) {
      hiddenTrElement.style.display = "none";
    }
    const maskElements = [] as Array<HTMLElement>;
    for (const rawLastTdElement of lastTrElement.children) {
      const lastTdElement = rawLastTdElement as HTMLElement;
      const maskElement = document.createElement("tr");
      maskElement.style.top = "-20px";
      maskElement.style.bottom = "0px";
      maskElement.style.left = "-1px";
      maskElement.style.right = "-1px";
      maskElement.style.background = "linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 70%)";
      maskElement.style.position = "absolute";
      maskElement.style.cursor = "pointer";
      maskElement.addEventListener("click", () => {
        for (const lastTrElement of hiddenTrElements) {
          lastTrElement.style.display = "table-row";
        }
        for (const maskElement of maskElements) {
          maskElement.remove();
        }
      });
      lastTdElement.style.position = "relative";
      lastTdElement.append(maskElement);
      maskElements.push(maskElement);
    }
  }

}


Executor.register();
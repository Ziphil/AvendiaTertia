/// <reference path="../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {BaseExecutor} from "./module/executor";


export class Executor extends BaseExecutor {

  protected prepare(): void {
    const elements = document.getElementsByClassName("card-table-button");
    for (const element of elements) {
      element.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;
        const ref = target.getAttribute("data-ref");
        if (ref) {
          document.getElementById(ref)?.scrollIntoView({behavior: "smooth", inline: "nearest", block: "nearest"});
        }
      });
    }
  }

}


Executor.register();
/// <reference path="../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {BaseExecutor} from "./module/executor";


export class Executor extends BaseExecutor {

  protected prepare(): void {
    const request = new XMLHttpRequest();
    const url = window.location.protocol + "//dic.ziphil.com/api/dictionary/difference?durations=7&durations=30&durations=365";
    request.open("GET", url, true);
    request.send(null);
    request.addEventListener("readystatechange", (event) => {
      if (request.readyState === 4 && request.status === 200) {
        const data = JSON.parse(request.responseText);
        for (const {duration, difference} of data.differences) {
          if (duration === 7) {
            document.querySelector("#week-count")!.textContent = Math.max(difference, 0).toString();
          } else if (duration === 30) {
            document.querySelector("#month-count")!.textContent = Math.max(difference, 0).toString();
          } else {
            document.querySelector("#year-count")!.textContent = Math.max(difference, 0).toString();
          }
        }
        document.querySelector("#whole-count")!.textContent = Math.max(data.count, 0).toString();
      }
    });
  }

}


Executor.register();
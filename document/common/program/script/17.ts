/// <reference path="../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import REFERENCE_INDEX_JSON from "../../../../log/reference/ja.json";
import {
  BaseExecutor
} from "./module/executor";


export class Executor extends BaseExecutor {

  protected prepare(): void {
    window.addEventListener("hashchange", () => {
      this.jump();
    });
    this.jump();
  }

  private jump(): void {
    const tag = window.location.hash.replace(/^#/, "");
    const href = REFERENCE_INDEX_JSON.hrefs[tag];
    if (href) {
      window.location.replace(href);
    }
  }

}


Executor.regsiter("direct");
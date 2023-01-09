/// <reference path="../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {
  createElement
} from "react";
import {
  createRoot
} from "react-dom/client";
import {
  BaseExecutor
} from "./module/executor";
import PlayerList from "./player-module/player-list";
import {
  SongSpec
} from "./player-module/player-pane";


export class Executor extends BaseExecutor {

  protected prepare(): void {
    const container = document.getElementById("main");
    if (container) {
      const root = createRoot(container);
      const specs = this.getSongSpecs();
      console.log(specs);
      root.render(createElement(PlayerList, {specs}));
    };
  }

  private getSongSpecs(): Array<SongSpec> {
    const elements = document.querySelectorAll<HTMLElement>("zp-song");
    const specs = [...elements].map((element) => {
      const titleShaleian = element.querySelector<HTMLElement>("zp-title-shaleian")?.innerText;
      const titleNormal = element.querySelector<HTMLElement>("zp-title-normal")?.innerText;
      const description = element.querySelector<HTMLElement>("zp-description")?.innerText;
      const spec = {
        number: parseInt(element.getAttribute("number") ?? "0"),
        title: (titleShaleian && titleNormal) ? {shaleian: titleShaleian, normal: titleNormal} : null,
        date: element.getAttribute("date") ?? "",
        length: parseInt(element.getAttribute("length") ?? "0"),
        googleId: element.getAttribute("google-id") ?? "",
        description: description ?? ""
      };
      return spec;
    });
    return specs;
  }

}


Executor.regsiter("load");
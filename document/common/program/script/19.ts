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
} from "./player-module/player-list";


const SONG_SPECS = [
  {
    number: 1,
    title: "xalíh acís",
    date: "2022/12/30",
    length: 101
  },
  {
    number: 2,
    title: "ritasac a fobôs avéf",
    date: "2023/01/01",
    length: 28
  }
] as Array<SongSpec>;


export class Executor extends BaseExecutor {

  protected prepare(): void {
    const container = document.getElementById("main");
    if (container) {
      const root = createRoot(container);
      root.render(createElement(PlayerList, {songSpecs: SONG_SPECS}));
    };
  }

}


Executor.regsiter("load");
/// <reference path="../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {createElement} from "react";
import {createRoot} from "react-dom/client";
import {getWords} from "./fennese/word";
import WordTable from "./fennese/word-table";
import {BaseExecutor} from "./module/executor";


export class Executor extends BaseExecutor {

  protected async prepare(): Promise<void> {
    const words = await getWords();
    console.log(words);
    const root = createRoot(document.getElementById("root")!);
    root.render(createElement(WordTable, {words}));
  }

}


Executor.register("load");
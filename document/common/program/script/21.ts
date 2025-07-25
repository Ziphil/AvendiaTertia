/// <reference path="../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {createElement} from "react";
import {createRoot} from "react-dom/client";
import AffixTable from "./fennese/affix-table";
import {getDictionary} from "./fennese/word";
import WordTable from "./fennese/word-table";
import {BaseExecutor} from "./module/executor";


export class Executor extends BaseExecutor {

  protected async prepare(): Promise<void> {
    const dictionary = await getDictionary();
    const root = createRoot(document.getElementById("root")!);
    root.render([
      createElement(WordTable, {dictionary}),
      createElement(AffixTable, {dictionary})
    ]);
  }

}


Executor.register("load");
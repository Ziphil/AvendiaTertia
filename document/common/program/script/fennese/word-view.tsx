/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {ReactElement} from "react";
import {data} from "../util/data";
import {Word} from "./word";


const WordView = function ({
  word,
  basic
}: {
  word: Word,
  basic: boolean
}): ReactElement {

  const node = (
    <div className="word-view" {...data({basic})}>
      <div className="word-view-name sans">{word.name}</div>
      <div className="word-view-equivalent">{word.equivalents.join(", ")}</div>
    </div>
  );
  return node;

};


export default WordView;
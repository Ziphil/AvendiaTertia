/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {ReactElement} from "react";
import {data} from "../util/data";
import {WORD_PATTERN_CATEGORY, WORD_PATTERN_TYPE, Word, WordRoot} from "./word";
import WordCell from "./word-cell";


const WordRow = function ({
  root,
  words,
  first
}: {
  root: WordRoot,
  words: Array<Word>,
  first: boolean
}): ReactElement {

  const node = (
    <div className="word-row" id={(first) ? root[0] : undefined}>
      <div className="word-initial-radical" {...data({first})}>
        <span className="sans">{(first) ? root[0] : null}</span>
      </div>
      <div className="word-row-main">
        <div className="word-root">
          <span className="word-root-radical sans">{root[0]}</span>
          <span className="word-root-separator">-</span>
          <span className="word-root-radical sans">{root[1]}</span>
          <span className="word-root-separator">-</span>
          <span className="word-root-radical sans">{root[2]}</span>
        </div>
        {WORD_PATTERN_CATEGORY.map((category) => WORD_PATTERN_TYPE.map((type) => (
          <WordCell key={category + "-" + type} root={root} pattern={{category, type}} words={words}/>
        )))}
      </div>
    </div>
  );
  return node;

};


export default WordRow;
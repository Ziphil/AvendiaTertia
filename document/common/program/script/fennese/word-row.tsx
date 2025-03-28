/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {ReactElement} from "react";
import {WORD_PATTERN_CATEGORY, WORD_PATTERN_TYPE, Word, WordRoot} from "./word";
import WordCell from "./word-cell";


const WordRow = function ({
  root,
  words
}: {
  root: WordRoot,
  words: Array<Word>
}): ReactElement {

  const node = (
    <div className="word-row">
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
  );
  return node;

};


export default WordRow;
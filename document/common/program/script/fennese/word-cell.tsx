/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {ReactElement} from "react";
import {Word, WordPattern, WordRoot} from "./word";
import WordView from "./word-view";


const WordCell = function ({
  root,
  pattern,
  words
}: {
  root: WordRoot,
  pattern: WordPattern,
  words: Array<Word>
}): ReactElement {

  const filteredWords = words.filter((word) => word.pattern?.category === pattern.category && word.pattern?.type === pattern.type);
  const basicWords = filteredWords.filter((word) => word.affixes.length <= 0);
  const affixedWords = filteredWords.filter((word) => word.affixes.length > 0);

  const node = (
    <div className="word-cell">
      {basicWords.map((word) => (
        <WordView key={word.name} word={word} basic={true}/>
      ))}
      {affixedWords.map((word) => (
        <WordView key={word.name} word={word} basic={false}/>
      ))}
    </div>
  );
  return node;

};


export default WordCell;
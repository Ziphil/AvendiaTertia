/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {PatternSort, PatternType, Root, Word} from "ogorasso";
import {ReactElement} from "react";
import {data} from "../util/data";
import WordView from "./word-view";


const WordCell = function ({
  root,
  patternSort,
  patternType,
  words
}: {
  root: Root,
  patternSort: PatternSort,
  patternType: PatternType,
  words: Array<Word>
}): ReactElement {

  const filteredWords = words.filter((word) => word.anatomy?.kind === "simplex" && word.anatomy.pattern.sort === patternSort && word.anatomy.pattern.type === patternType);
  const basicWords = filteredWords.filter((word) => getBasic(word));
  const affixedWords = filteredWords.filter((word) => !getBasic(word));

  const invalid = root.length === 4 && patternType !== "ground";

  const node = (
    <div className="word-cell" {...data({invalid})}>
      {basicWords.map((word) => (
        <WordView key={word.number} word={word} basic={true}/>
      ))}
      {affixedWords.map((word) => (
        <WordView key={word.number} word={word} basic={false}/>
      ))}
    </div>
  );
  return node;

};


function getBasic(word: Word): boolean {
  const affixes = (word.anatomy?.kind === "simplex") ? word.anatomy.affixes : undefined;
  if (affixes !== undefined) {
    return Object.values(affixes).every((affixes) => affixes.length <= 0);
  } else {
    return false;
  }
}

export default WordCell;
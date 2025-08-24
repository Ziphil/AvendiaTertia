/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {NormalWord, PatternCategory, PatternType, Root, getPatternCategory, getPatternType} from "ogorasso";
import {ReactElement} from "react";
import WordView from "./word-view";


const WordCell = function ({
  root,
  patternCategory,
  patternType,
  words
}: {
  root: Root,
  patternCategory: PatternCategory,
  patternType: PatternType,
  words: Array<NormalWord>
}): ReactElement {

  const filteredWords = words.filter((word) => word.anatomy?.kind === "simplex" && getPatternCategory(word.anatomy.pattern.spelling) === patternCategory && getPatternType(word.anatomy.pattern.spelling) === patternType);
  const basicWords = filteredWords.filter((word) => getBasic(word));
  const affixedWords = filteredWords.filter((word) => !getBasic(word));

  const node = (
    <div className="word-cell">
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


function getBasic(word: NormalWord): boolean {
  const affixes = (word.anatomy?.kind === "simplex") ? word.anatomy.affixes : undefined;
  if (affixes !== undefined) {
    return Object.values(affixes).every((affixes) => affixes.length <= 0);
  } else {
    return false;
  }
}


export default WordCell;
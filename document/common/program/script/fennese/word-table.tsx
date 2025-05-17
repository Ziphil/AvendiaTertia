/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {ReactElement} from "react";
import DATA from "./data.json";
import {Dictionary, WORD_PATTERN_CATEGORY, WORD_PATTERN_TYPE, Word, WordRoot} from "./word";
import WordRow from "./word-row";


const WordTable = function ({
  dictionary
}: {
  dictionary: Dictionary
}): ReactElement {

  const groupedWords = groupWords(dictionary.words);

  const node = (
    <div className="word-table">
      <div className="word-header-row">
        <div/>
        <div/>
        {WORD_PATTERN_CATEGORY.map((category) => WORD_PATTERN_TYPE.map((type) => (
          <div key={category + "-" + type} className="word-header-cell">
            <span>
              {(category === "verb") ? (
                <>用言 </>
              ) : (
                <>体言 </>
              )}
              {(type === "ground") ? (
                <>G 型</>
              ) : (type === "doubleMedial") ? (
                <>D<sub className="sub">2</sub> 型</>
              ) : (type === "doubleFinal") ? (
                <>D<sub className="sub">3</sub> 型</>
              ) : (type === "doubleInitial") ? (
                <>D<sub className="sub">1</sub> 型</>
              ) : null}
            </span>
          </div>
        )))}
      </div>
      {groupedWords.map(([rootString, {root, words, first}]) => (
        (root !== null) && <WordRow key={rootString} root={root} words={words} first={first}/>
      ))}
      <div className="word-footer-row">
        <div className="root-count">{dictionary.rootCount}</div>
        <div className="word-count">{dictionary.wordCount}</div>
      </div>
    </div>
  );
  return node;

};


function groupWords(words: Array<Word>): Array<[string, {root: WordRoot | null, words: Array<Word>, first: boolean}]> {
  const groupedWords = new Map<string, {root: WordRoot | null, words: Array<Word>, first: boolean}>();
  for (const word of words) {
    const rootString = word.root?.join("-") ?? "";
    if (!groupedWords.has(rootString)) {
      groupedWords.set(rootString, {root: word.root, words: [], first: false});
    }
    groupedWords.get(rootString)!.words.push(word);
  }
  const groupedWordEntries = Array.from(groupedWords.entries());
  groupedWordEntries.sort(([, {root: firstRoot}], [, {root: secondRoot}]) => {
    if (firstRoot !== null && secondRoot !== null) {
      const firstRootIndices = firstRoot.map((radical) => DATA.alphabets.indexOf(radical).toString().padStart(2, "0"));
      const secondRootIndices = secondRoot.map((radical) => DATA.alphabets.indexOf(radical).toString().padStart(2, "0"));
      return firstRootIndices.join("-").localeCompare(secondRootIndices.join("-"));
    } else {
      return 0;
    }
  });
  let currentRadical = "";
  for (const [, wordSpec] of groupedWordEntries) {
    if (wordSpec.root !== null) {
      const radical = wordSpec.root[0];
      if (radical !== currentRadical) {
        currentRadical = radical;
        wordSpec.first = true;
      }
    }
  }
  return groupedWordEntries;
}

export default WordTable;
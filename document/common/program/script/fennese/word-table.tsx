/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {NormalWord, PATTERN_CATEGORIES, PATTERN_TYPES, RADICALS, Root, Word} from "ogorasso";
import {ReactElement} from "react";
import {Dictionary} from "./word";
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
        {PATTERN_CATEGORIES.map((patternCategory) => PATTERN_TYPES.map((patternType) => (
          <div key={patternCategory + "-" + patternType} className="word-header-cell">
            <span>
              {(patternCategory === "verb") ? (
                <>用言 </>
              ) : (
                <>体言 </>
              )}
              {(patternType === "ground") ? (
                <>G 型</>
              ) : (patternType === "doubleMedial") ? (
                <>D<sub className="sub">2</sub> 型</>
              ) : (patternType === "doubleFinal") ? (
                <>D<sub className="sub">3</sub> 型</>
              ) : (patternType === "doubleInitial") ? (
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


function groupWords(words: Array<Word>): Array<[string, {root: Root, words: Array<NormalWord>, first: boolean}]> {
  const groupedWords = new Map<string, {root: Root, words: Array<NormalWord>, first: boolean}>();
  for (const word of words) {
    if (word.kind === "normal" && word.anatomy !== null) {
      const rootString = word.anatomy.root.join("-");
      if (!groupedWords.has(rootString)) {
        groupedWords.set(rootString, {root: word.anatomy.root, words: [], first: false});
      }
      groupedWords.get(rootString)!.words.push(word);
    }
  }
  const groupedWordEntries = Array.from(groupedWords.entries());
  groupedWordEntries.sort(([, {root: firstRoot}], [, {root: secondRoot}]) => {
    if (firstRoot !== null && secondRoot !== null) {
      const firstRootIndices = firstRoot.map((radical) => RADICALS.indexOf(radical).toString().padStart(2, "0"));
      const secondRootIndices = secondRoot.map((radical) => RADICALS.indexOf(radical).toString().padStart(2, "0"));
      return firstRootIndices.join("-").localeCompare(secondRootIndices.join("-"));
    } else {
      return 0;
    }
  });
  let currentInitialRadical = "";
  for (const [, wordSpec] of groupedWordEntries) {
    if (wordSpec.root !== null) {
      const initialRadical = wordSpec.root[0];
      if (initialRadical !== currentInitialRadical) {
        currentInitialRadical = initialRadical;
        wordSpec.first = true;
      }
    }
  }
  return groupedWordEntries;
}

export default WordTable;
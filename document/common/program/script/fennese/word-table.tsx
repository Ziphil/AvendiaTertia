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

  const wordSpecs = groupWords(dictionary.words);

  const node = (
    <article className="word-table">
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
      {wordSpecs.map(([rootNumber, {root, words, foreign, first}]) => (
        <WordRow key={rootNumber} root={root} words={words} foreign={foreign} first={first}/>
      ))}
      <div className="word-footer-row">
        <div className="root-count">{dictionary.rootCount}</div>
        <div className="word-count">{dictionary.wordCount}</div>
      </div>
    </article>
  );
  return node;

};


function getForeignRootNumbers(words: Array<Word>): Set<number> {
  const foreignRootNumbers = new Set<number>();
  for (const word of words) {
    if (word.kind === "root" && word.foreign) {
      foreignRootNumbers.add(word.number);
    }
  }
  return foreignRootNumbers;
}

function groupWords(words: Array<Word>): Array<[number, WordSpec]> {
  const wordSpecs = new Map<number, WordSpec>();
  const foreignRootNumbers = getForeignRootNumbers(words);
  for (const word of words) {
    if (word.kind === "normal" && word.anatomy?.kind === "simplex") {
      const rootNumber = word.anatomy.root.number;
      if (!wordSpecs.has(rootNumber)) {
        const foreign = foreignRootNumbers.has(rootNumber);
        wordSpecs.set(rootNumber, {root: word.anatomy.root.root, words: [], foreign, first: false});
      }
      wordSpecs.get(rootNumber)!.words.push(word);
    }
  }
  const wordSpecEntries = Array.from(wordSpecs.entries());
  wordSpecEntries.sort(([, {root: firstRoot}], [, {root: secondRoot}]) => {
    if (firstRoot !== null && secondRoot !== null) {
      const firstRootIndices = firstRoot.map((radical) => RADICALS.indexOf(radical).toString().padStart(2, "0"));
      const secondRootIndices = secondRoot.map((radical) => RADICALS.indexOf(radical).toString().padStart(2, "0"));
      return firstRootIndices.join("-").localeCompare(secondRootIndices.join("-"));
    } else {
      return 0;
    }
  });
  let currentInitialRadical = "";
  for (const [, wordSpec] of wordSpecEntries) {
    const initialRadical = wordSpec.root[0];
    if (initialRadical !== currentInitialRadical) {
      currentInitialRadical = initialRadical;
      wordSpec.first = true;
    }
  }
  return wordSpecEntries;
}

type WordSpec = {
  root: Root,
  words: Array<NormalWord>,
  foreign: boolean,
  first: boolean
};

export default WordTable;
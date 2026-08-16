/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {Entry, PATTERN_SORTS, PATTERN_TYPES, RADICALS, Root, Word} from "ogorasso";
import {ReactElement} from "react";
import {Dictionary} from "./word";
import WordRow from "./word-row";


const WordTable = function ({
  dictionary
}: {
  dictionary: Dictionary
}): ReactElement {

  const wordSpecs = groupEntriess(dictionary.entries);

  const node = (
    <article className="word-table">
      <div className="word-header-row">
        <div/>
        <div/>
        {PATTERN_SORTS.map((patternSort) => PATTERN_TYPES.map((patternType) => (
          <div key={patternSort + "-" + patternType} className="word-header-cell">
            <span>
              {(patternSort === "verbant") ? (
                "用言 "
              ) : (
                "体言 "
              )}
              {(patternType === "ground") ? (
                "G 型"
              ) : (patternType === "doubleMedial") ? (
                "Dm 型"
              ) : (patternType === "doubleFinal") ? (
                "Df 型"
              ) : (patternType === "doubleInitial") ? (
                "Di 型"
              ) : null}
            </span>
          </div>
        )))}
      </div>
      {wordSpecs.map(([rootNumber, {root, words, borrowed, first}]) => (
        <WordRow key={rootNumber} root={root} words={words} borrowed={borrowed} first={first}/>
      ))}
      <div className="word-footer-row">
        <div className="root-count">{dictionary.rootCount}</div>
        <div className="word-count">{dictionary.wordCount}</div>
      </div>
    </article>
  );
  return node;

};


function getBorrowedRootNumbers(entries: Array<Entry>): Set<number> {
  const borrowedRootNumbers = new Set<number>();
  for (const entry of entries) {
    if (entry.kind === "root" && entry.origin !== "proper") {
      borrowedRootNumbers.add(entry.number);
    }
  }
  return borrowedRootNumbers;
}

function groupEntriess(entries: Array<Entry>): Array<[number, WordSpec]> {
  const wordSpecs = new Map<number, WordSpec>();
  const borrowedRootNumbers = getBorrowedRootNumbers(entries);
  for (const entry of entries) {
    if (entry.kind === "word" && entry.anatomy?.kind === "simplex") {
      const rootNumber = entry.anatomy.root.number;
      if (!wordSpecs.has(rootNumber)) {
        const borrowed = borrowedRootNumbers.has(rootNumber);
        wordSpecs.set(rootNumber, {root: entry.anatomy.root.root, words: [], borrowed, first: false});
      }
      wordSpecs.get(rootNumber)!.words.push(entry);
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
  words: Array<Word>,
  borrowed: boolean,
  first: boolean
};

export default WordTable;
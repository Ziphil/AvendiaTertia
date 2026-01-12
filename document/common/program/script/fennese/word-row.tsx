/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {PATTERN_CATEGORIES, PATTERN_TYPES, Radicals, Word} from "ogorasso";
import {Fragment, ReactElement} from "react";
import {data} from "../util/data";
import WordCell from "./word-cell";


const WordRow = function ({
  radicals,
  words,
  borrowed,
  first
}: {
  radicals: Radicals,
  words: Array<Word>,
  borrowed: boolean,
  first: boolean
}): ReactElement {

  const node = (
    <div className="word-row" id={(first) ? radicals[0] : undefined}>
      <div className="word-initial-radical" {...data({first})}>
        <span className="sans">{(first) ? radicals[0] : null}</span>
      </div>
      <div className="word-row-main" {...data({borrowed})}>
        <div className="word-root">
          <span className="word-root-radical sans">{radicals[0]}</span>
          <span className="word-root-separator">-</span>
          <span className="word-root-radical sans">{radicals[1]}</span>
          {(radicals.length > 2) && (
            <Fragment>
              <span className="word-root-separator">-</span>
              <span className="word-root-radical sans">{radicals[2]}</span>
            </Fragment>
          )}
          {(radicals.length > 3) && (
            <Fragment>
              <span className="word-root-separator">-</span>
              <span className="word-root-radical sans">{radicals[3]}</span>
            </Fragment>
          )}
        </div>
        {PATTERN_CATEGORIES.map((patternCategory) => PATTERN_TYPES.map((patternType) => (
          <WordCell key={patternCategory + "-" + patternType} radicals={radicals} patternCategory={patternCategory} patternType={patternType} words={words}/>
        )))}
      </div>
    </div>
  );
  return node;

};


export default WordRow;
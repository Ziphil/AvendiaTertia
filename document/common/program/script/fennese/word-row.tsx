/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {NormalWord, PATTERN_CATEGORIES, PATTERN_TYPES, Root} from "ogorasso";
import {Fragment, ReactElement} from "react";
import {data} from "../util/data";
import WordCell from "./word-cell";


const WordRow = function ({
  root,
  words,
  first
}: {
  root: Root,
  words: Array<NormalWord>,
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
          {(root.length > 3) && (
            <Fragment>
              <span className="word-root-separator">-</span>
              <span className="word-root-radical sans">{root[3]}</span>
            </Fragment>
          )}
        </div>
        {PATTERN_CATEGORIES.map((patternCategory) => PATTERN_TYPES.map((patternType) => (
          <WordCell key={patternCategory + "-" + patternType} root={root} patternCategory={patternCategory} patternType={patternType} words={words}/>
        )))}
      </div>
    </div>
  );
  return node;

};


export default WordRow;
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {AffixWord} from "ogorasso";
import {ReactElement} from "react";


const AffixView = function ({
  word
}: {
  word: AffixWord
}): ReactElement {

  const dictionaryUrl = `https://zpdic.ziphil.com/dictionary/fennese?kind=exact&number=${word.number}`;

  const node = (
    <div className="word-view">
      <a className="word-view-name sans" href={dictionaryUrl} target="_blank" rel="noopener noreferrer">{word.affix}</a>
      <div className="word-view-equivalent">{word.equivalents.map((equivalent) => equivalent.terms[0]).join(", ")}</div>
    </div>
  );
  return node;

};


export default AffixView;
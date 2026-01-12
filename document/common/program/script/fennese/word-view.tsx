/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {Word} from "ogorasso";
import {ReactElement} from "react";
import {data} from "../util/data";


const WordView = function ({
  word,
  basic
}: {
  word: Word,
  basic: boolean
}): ReactElement {

  const dictionaryUrl = `https://zpdic.ziphil.com/dictionary/fennese?kind=exact&number=${word.number}`;

  const shownEquivalents = word.sections.flatMap((section) => section.equivalents).filter((equivalent) => !equivalent.hidden && equivalent.terms.length > 0);

  const node = (
    <div className="word-view" {...data({basic})}>
      <a className="word-view-name sans" href={dictionaryUrl} target="_blank" rel="noopener noreferrer">
        {word.spelling}
      </a>
      <div className="word-view-equivalent">
        {shownEquivalents.map((equivalent) => equivalent.terms[0]).join(", ")}
      </div>
    </div>
  );
  return node;

};


export default WordView;
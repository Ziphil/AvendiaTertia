/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {AFFIX_TYPES, AffixType, AffixWord, Word, getAffixType} from "ogorasso";
import {ReactElement} from "react";
import AffixView from "./affix-view";
import {Dictionary} from "./word";


const AffixTable = function ({
  dictionary
}: {
  dictionary: Dictionary
}): ReactElement {

  const affixWords = getAffixWords(dictionary.words);

  const node = (
    <article className="affix-table">
      <div className="affix-header-row">
        {AFFIX_TYPES.map((affixType) => (
          <div key={affixType} className="affix-header-cell">
            <span>
              {(affixType === "prestem") ? (
                <>語幹前</>
              ) : (affixType === "prethematic") ? (
                <>幹母音前</>
              ) : (affixType === "postthematic") ? (
                <>幹母音後</>
              ) : (affixType === "poststem") ? (
                <>語幹後</>
              ) : null}
            </span>
          </div>
        ))}
      </div>
      <div className="affix-row">
        {AFFIX_TYPES.map((affixType) => (
          <div key={affixType} className="affix-cell">
            {affixWords[affixType].map((word) => (
              <AffixView key={word.toString()} word={word}/>
            ))}
          </div>
        ))}
      </div>
    </article>
  );
  return node;

};


function getAffixWords(words: Array<Word>): Record<AffixType, Array<AffixWord>> {
  const affixWords = {
    prestem: [],
    prethematic: [],
    postthematic: [],
    poststem: []
  } as Record<AffixType, Array<AffixWord>>;
  for (const word of words) {
    if (word.kind === "affix") {
      const affixType = getAffixType(word.affix);
      if (affixType !== null) {
        affixWords[affixType].push(word);
      }
    }
  }
  for (const affixType of AFFIX_TYPES) {
    affixWords[affixType].sort((first, second) => first.affix.length - second.affix.length);
  }
  return affixWords;
}

export default AffixTable;
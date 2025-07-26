/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {AFFIX_TYPES, AffixType, AffixWord, NormalWord, Word, getAffixType} from "ogorasso";
import {ReactElement} from "react";
import {data} from "../util/data";
import AffixView from "./affix-view";
import {Dictionary} from "./word";


const AffixTable = function ({
  dictionary
}: {
  dictionary: Dictionary
}): ReactElement {

  const affixWords = getAffixWords(dictionary.words);

  const node = (
    <article className="affix-table-container">
      <div className="affix-table" {...data({count: "4"})}>
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
      </div>
      <div className="affix-table" {...data({count: "2"})}>
        <div className="affix-header-row">
          {ADDITIONAL_AFFIX_TYPES.map((affixType) => (
            <div key={affixType} className="affix-header-cell">
              <span>
                {(affixType === "preposition") ? (
                  <>前置詞</>
                ) : (affixType === "particle") ? (
                  <>小詞</>
                ) : null}
              </span>
            </div>
          ))}
        </div>
        <div className="affix-row">
          {ADDITIONAL_AFFIX_TYPES.map((affixType) => (
            <div key={affixType} className="affix-cell">
              {affixWords[affixType].map((word) => (
                <AffixView key={word.toString()} word={word}/>
              ))}
            </div>
          ))}
        </div>
      </div>
    </article>
  );
  return node;

};


const ADDITIONAL_AFFIX_TYPES = ["preposition", "particle"] as const;

function getAffixWords(words: Array<Word>): Record<AffixType, Array<AffixWord>> & {preposition: Array<NormalWord>, particle: Array<NormalWord>} {
  const affixWords = {
    prestem: [] as Array<AffixWord>,
    prethematic: [] as Array<AffixWord>,
    postthematic: [] as Array<AffixWord>,
    poststem: [] as Array<AffixWord>,
    preposition: [] as Array<NormalWord>,
    particle: [] as Array<NormalWord>
  };
  for (const word of words) {
    if (word.kind === "affix") {
      const affixType = getAffixType(word.affix);
      if (affixType !== null) {
        affixWords[affixType].push(word);
      }
    } else if (word.kind === "normal" && word.equivalents[0]?.titles[0] === "前置詞") {
      affixWords.preposition.push(word);
    } else if (word.kind === "normal" && word.equivalents[0]?.titles[0] === "小詞") {
      affixWords.particle.push(word);
    }
  }
  for (const affixType of [...AFFIX_TYPES, ...ADDITIONAL_AFFIX_TYPES]) {
    affixWords[affixType].sort((first, second) => {
      const firstForm = "affix" in first ? first.affix : first.form;
      const secondForm = "affix" in second ? second.affix : second.form;
      return firstForm.length - secondForm.length;
    });
  }
  return affixWords;
}

export default AffixTable;
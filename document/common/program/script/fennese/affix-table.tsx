/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {Affix, AffixType, Entry, Word} from "ogorasso";
import {ReactElement} from "react";
import {data} from "../util/data";
import AffixView from "./affix-view";
import {Dictionary} from "./word";


const AffixTable = function ({
  dictionary
}: {
  dictionary: Dictionary
}): ReactElement {

  const affixWords = getAffixWords(dictionary.entries);

  const node = (
    <article className="affix-table-container">
      <div className="affix-table" {...data({count: "2"})}>
        <div className="affix-header-row">
          {AFFIX_TYPES.map((affixType) => (
            <div key={affixType} className="affix-header-cell">
              <span>
                {(affixType === "prefixal") ? (
                  <>語幹前</>
                ) : (affixType === "infixal") ? (
                  <>幹母音前</>
                ) : (affixType === "suffixal") ? (
                  <>語幹後</>
                ) : (affixType === "terminal") ? (
                  <>語末</>
                ) : null}
              </span>
            </div>
          ))}
        </div>
        <div className="affix-row">
          {AFFIX_TYPES.map((affixType) => (
            <div key={affixType} className="affix-cell">
              {affixWords[affixType].map((word) => (
                <AffixView key={word.number} word={word}/>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="affix-table" {...data({count: "3"})}>
        <div className="affix-header-row">
          {ADDITIONAL_TYPES.map((affixType) => (
            <div key={affixType} className="affix-header-cell">
              <span>
                {(affixType === "preposition") ? (
                  <>前置詞</>
                ) : (affixType === "special") ? (
                  <>特殊詞</>
                ) : (affixType === "particle") ? (
                  <>小詞</>
                ) : null}
              </span>
            </div>
          ))}
        </div>
        <div className="affix-row">
          {ADDITIONAL_TYPES.map((affixType) => (
            <div key={affixType} className="affix-cell">
              {affixWords[affixType].map((word) => (
                <AffixView key={word.number} word={word}/>
              ))}
            </div>
          ))}
        </div>
      </div>
    </article>
  );
  return node;

};


const AFFIX_TYPES = ["prefixal", "infixal"] as const;
const ADDITIONAL_TYPES = ["preposition", "special", "particle"] as const;

type AdditionalType = (typeof ADDITIONAL_TYPES)[number];

function getAffixWords(entries: Array<Entry>): Record<AffixType, Array<Affix>> & Record<AdditionalType, Array<Word>> {
  const affixWords = {
    prefixal: [] as Array<Affix>,
    infixal: [] as Array<Affix>,
    suffixal: [] as Array<Affix>,
    terminal: [] as Array<Affix>,
    preposition: [] as Array<Word>,
    special: [] as Array<Word>,
    particle: [] as Array<Word>
  };
  for (const entry of entries) {
    if (entry.kind === "affix") {
      const affixType = entry.type;
      if (affixType !== null) {
        affixWords[affixType].push(entry);
      }
    } else if (entry.kind === "word" && entry.sections[0]?.equivalents[0]?.titles[0] === "前置詞") {
      affixWords.preposition.push(entry);
    } else if (entry.kind === "word" && entry.sections[0]?.equivalents[0]?.titles[0] === "特殊詞") {
      affixWords.special.push(entry);
    } else if (entry.kind === "word" && entry.sections[0]?.equivalents[0]?.titles[0] === "小詞") {
      affixWords.particle.push(entry);
    }
  }
  for (const affixType of [...AFFIX_TYPES, ...ADDITIONAL_TYPES]) {
    affixWords[affixType].sort((first, second) => first.spelling.length - second.spelling.length);
  }
  return affixWords;
}

export default AffixTable;
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {AffixEntry, AffixType, Entry, Word} from "ogorasso";
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
                  <>成幹母音前</>
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
                  <>前置辞</>
                ) : (affixType === "special") ? (
                  <>汎詞</>
                ) : (affixType === "particle") ? (
                  <>小辞</>
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

function getAffixWords(entries: Array<Entry>): Record<AffixType, Array<AffixEntry>> & Record<AdditionalType, Array<Word>> {
  const affixWords = {
    prefixal: [] as Array<AffixEntry>,
    infixal: [] as Array<AffixEntry>,
    suffixal: [] as Array<AffixEntry>,
    terminal: [] as Array<AffixEntry>,
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
    } else if (entry.kind === "word" && entry.sections[0]?.equivalents[0]?.titles[0] === "前置辞") {
      affixWords.preposition.push(entry);
    } else if (entry.kind === "word" && entry.sections[0]?.equivalents[0]?.titles[0] === "汎詞") {
      affixWords.special.push(entry);
    } else if (entry.kind === "word" && entry.sections[0]?.equivalents[0]?.titles[0] === "小辞") {
      affixWords.particle.push(entry);
    }
  }
  for (const affixType of [...AFFIX_TYPES, ...ADDITIONAL_TYPES]) {
    affixWords[affixType].sort((first, second) => first.spelling.length - second.spelling.length);
  }
  return affixWords;
}

export default AffixTable;
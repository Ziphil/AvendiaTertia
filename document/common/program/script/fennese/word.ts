/* eslint-disable @typescript-eslint/naming-convention */

import DATA from "./data.json";


export interface Word {

  readonly name: string;
  readonly equivalents: Array<string>;
  readonly root: WordRoot | null;
  readonly pattern: WordPattern | null;
  readonly affixes: Array<string>;

}


export async function getWords(): Promise<Array<Word>> {
  const response = await fetch("/file/dictionary/2.json");
  const json = await response.json();
  const words = json["words"].map(createWord);
  return words;
}

function createWord(rawWord: any): Word {
  const rawTranslations = rawWord["translations"] as Array<any>;
  const rawRelations = rawWord["relations"] as Array<any>;
  const word = {
    name: rawWord["entry"]["form"],
    equivalents: rawTranslations.map((rawTranslation) => rawTranslation["forms"][0]),
    root: parseRoot(rawRelations.filter((rawRelation) => rawRelation["title"] === "語根").map((rawRelation) => rawRelation["entry"]["form"])[0]),
    pattern: parsePattern(rawRelations.filter((rawRelation) => rawRelation["title"] === "語型")),
    affixes: parseAffixes(rawRelations.filter((rawRelation) => rawRelation["title"] === "語型"))
  };
  return word;
}

function parseRoot(rawRoot: string | undefined): WordRoot | null {
  if (rawRoot !== undefined) {
    const match = rawRoot.match(/^‹(.+)-(.+)-(.+)›$/);
    if (match !== null) {
      return [match[1].toLowerCase(), match[2].toLowerCase(), match[3].toLowerCase()];
    } else {
      return null;
    }
  } else {
    return null;
  }
}

function parsePattern(rawRelations: Array<any>): WordPattern | null {
  const patterns = rawRelations.map((rawRelation) => {
    const rawForm = rawRelation["entry"]["form"];
    const pattern = (DATA.patterns as any)[rawForm] ?? null;
    return pattern;
  });
  const pattern = patterns.find((pattern) => pattern !== null) ?? null;
  return pattern;
}

function parseAffixes(rawRelations: Array<any>): Array<string> {
  const affixes = rawRelations.map((rawRelation) => {
    const rawForm = rawRelation["entry"]["form"];
    if ((DATA.patterns as any)[rawForm] === undefined) {
      const affix = rawForm.match(/^‹(.*)›$/)?.[1] ?? null;
      if (affix !== null && !affix.startsWith("=")) {
        return affix;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }).filter((affix) => affix !== null);
  return affixes;
}

export type WordRoot = [string, string, string];
export type WordPattern = {category: WordPatternCategory, type: WordPatternType};

export const WORD_PATTERN_CATEGORY = ["verb", "substantive"] as const;
export type WordPatternCategory = typeof WORD_PATTERN_CATEGORY[number];

export const WORD_PATTERN_TYPE = ["ground", "doubleMedial", "doubleFinal", "doubleInitial"] as const;
export type WordPatternType = typeof WORD_PATTERN_TYPE[number];
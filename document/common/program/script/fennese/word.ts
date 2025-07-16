/* eslint-disable @typescript-eslint/naming-convention */

import DATA from "./data.json";


export interface Word {

  readonly number: number;
  readonly name: string;
  readonly equivalents: Array<string>;
  readonly root: WordRoot | null;
  readonly pattern: WordPattern | null;
  readonly affixes: Array<string>;

}


export interface Dictionary {

  readonly words: Array<Word>;
  readonly rootCount: number;
  readonly wordCount: number;

}


export async function getDictionary(): Promise<Dictionary> {
  const fetchRawWords = async function (page: number): Promise<[Array<any>, number]> {
    const response = await fetch(`https://script.google.com/macros/s/AKfycbxXib3bXPFx0eYP_No0Kb2YVtFriB6t2KGqiRnLoeIx3DRtcgjpBbf5aWgN0Vhmqg/exec?text=&skip=${page * 100}&limit=100`);
    const json = await response.json();
    return [json["words"], json["total"]];
  };
  const [firstRawWords, total] = await fetchRawWords(0);
  const lastRawWords = await Promise.all(Array.from({length: Math.floor((total - 1) / 100)}, async (dummy, index) => {
    const [lastRawWords] = await fetchRawWords(index + 1);
    return lastRawWords;
  }));
  const rawWords = [...firstRawWords, ...lastRawWords.flat()];
  const words = rawWords.map(createWord);
  const rootCount = calcRootCount(rawWords);
  const wordCount = calcWordCount(rawWords);
  console.log(`Words fetched from api: ${rootCount} roots, ${wordCount} words`);
  return {words, rootCount, wordCount};
}

function createWord(rawWord: any): Word {
  const rawEquivalents = rawWord["equivalents"] as Array<any>;
  const rawRelations = rawWord["relations"] as Array<any>;
  const word = {
    number: +rawWord["number"],
    name: rawWord["name"],
    equivalents: rawEquivalents.map((rawEquivalent) => rawEquivalent["names"][0]),
    root: parseRoot(rawRelations.filter((rawRelation) => rawRelation["titles"][0] === "語根").map((rawRelation) => rawRelation["name"])[0]),
    pattern: parsePattern(rawRelations.filter((rawRelation) => rawRelation["titles"][0] === "語型")),
    affixes: parseAffixes(rawRelations.filter((rawRelation) => rawRelation["titles"][0] === "語型"))
  };
  return word;
}

function parseRoot(rawRoot: string | undefined): WordRoot | null {
  if (rawRoot !== undefined) {
    const match = rawRoot.match(/^√(.+)-(.+)-(.+)$/);
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
    const rawForm = rawRelation["name"];
    const pattern = (DATA.patterns as any)[rawForm] ?? null;
    return pattern;
  });
  const pattern = patterns.find((pattern) => pattern !== null) ?? null;
  return pattern;
}

function parseAffixes(rawRelations: Array<any>): Array<string> {
  const affixes = rawRelations.map((rawRelation) => {
    const rawForm = rawRelation["name"];
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

function calcRootCount(rawWords: Array<any>): number {
  const roots = new Set<string>();
  for (const rawWord of rawWords) {
    const rawRelations = rawWord["relations"] as Array<any>;
    const rawRoot = rawRelations.filter((rawRelation) => rawRelation["titles"][0] === "語根").map((rawRelation) => rawRelation["name"])[0];
    if (rawRoot?.match(/^√(.+)-(.+)-(.+)$/)) {
      roots.add(rawRoot);
    }
  }
  return roots.size;
}

function calcWordCount(rawWords: Array<any>): number {
  const otherCount = rawWords.filter((rawWord) => rawWord["tags"].includes("語根") || rawWord["tags"].includes("語型") || rawWord["tags"].includes("語型接辞")).length;
  const wordCount = rawWords.length - otherCount;
  return wordCount;
}

export type WordRoot = [string, string, string];
export type WordPattern = {category: WordPatternCategory, type: WordPatternType};

export const WORD_PATTERN_CATEGORY = ["verb", "substantive"] as const;
export type WordPatternCategory = typeof WORD_PATTERN_CATEGORY[number];

export const WORD_PATTERN_TYPE = ["ground", "doubleMedial", "doubleFinal", "doubleInitial"] as const;
export type WordPatternType = typeof WORD_PATTERN_TYPE[number];
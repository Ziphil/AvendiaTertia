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
  const apiKey = location.search.match(/apiKey=([^&]+)/)?.[1] ?? null;
  if (apiKey !== null) {
    return await getDictionaryFromApi(apiKey);
  } else {
    return await getDictionaryFromFile();
  }
}

export async function getDictionaryFromApi(apiKey: string): Promise<Dictionary> {
  const fetchRawWords = async function (page: number): Promise<[Array<any>, number]> {
    const response = await fetch(`https://zpdic.ziphil.com/api/v0/dictionary/fennese/words?text=&skip=${page * 100}&limit=100`, {headers: {"X-Api-Key": apiKey}});
    const json = await response.json();
    return [json["words"], json["total"]];
  };
  const [firstRawWords, total] = await fetchRawWords(0);
  const lastRawWords = await Promise.all(Array.from({length: Math.floor((total - 1) / 100)}, async (dummy, index) => {
    const [lastRawWords] = await fetchRawWords(index + 1);
    return lastRawWords;
  }));
  const rawWords = [...firstRawWords, ...lastRawWords.flat()];
  const words = rawWords.map(createWordFromZpdic);
  const rootCount = calcRootCountFromZpdic(rawWords);
  const wordCount = calcWordCountFromZpdic(rawWords);
  console.log(`Words fetched from api: ${rootCount} roots, ${wordCount} words`);
  return {words, rootCount, wordCount};
}

export async function getDictionaryFromFile(): Promise<Dictionary> {
  const response = await fetch("/file/dictionary/2.json");
  const json = await response.json();
  const words = json["words"].map(createWordFromOtm);
  const rootCount = calcRootCountFromOtm(json["words"]);
  const wordCount = calcWordCountFromOtm(json["words"]);
  console.log(`Words fetched from file: ${rootCount} roots, ${wordCount} words`);
  return {words, rootCount, wordCount};
}

function createWordFromOtm(rawWord: any): Word {
  const rawTranslations = rawWord["translations"] as Array<any>;
  const rawRelations = rawWord["relations"] as Array<any>;
  const word = {
    number: +rawWord["entry"]["id"],
    name: rawWord["entry"]["form"],
    equivalents: rawTranslations.map((rawTranslation) => rawTranslation["forms"][0]),
    root: parseRoot(rawRelations.filter((rawRelation) => rawRelation["title"] === "語根").map((rawRelation) => rawRelation["entry"]["form"])[0]),
    pattern: parsePatternFromOtm(rawRelations.filter((rawRelation) => rawRelation["title"] === "語型")),
    affixes: parseAffixesFromOtm(rawRelations.filter((rawRelation) => rawRelation["title"] === "語型"))
  };
  return word;
}

function createWordFromZpdic(rawWord: any): Word {
  const rawEquivalents = rawWord["equivalents"] as Array<any>;
  const rawRelations = rawWord["relations"] as Array<any>;
  const word = {
    number: +rawWord["number"],
    name: rawWord["name"],
    equivalents: rawEquivalents.map((rawEquivalent) => rawEquivalent["names"][0]),
    root: parseRoot(rawRelations.filter((rawRelation) => rawRelation["titles"][0] === "語根").map((rawRelation) => rawRelation["name"])[0]),
    pattern: parsePatternFromZpdic(rawRelations.filter((rawRelation) => rawRelation["titles"][0] === "語型")),
    affixes: parseAffixesFromZpdic(rawRelations.filter((rawRelation) => rawRelation["titles"][0] === "語型"))
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

function parsePatternFromOtm(rawRelations: Array<any>): WordPattern | null {
  const patterns = rawRelations.map((rawRelation) => {
    const rawForm = rawRelation["entry"]["form"];
    const pattern = (DATA.patterns as any)[rawForm] ?? null;
    return pattern;
  });
  const pattern = patterns.find((pattern) => pattern !== null) ?? null;
  return pattern;
}

function parsePatternFromZpdic(rawRelations: Array<any>): WordPattern | null {
  const patterns = rawRelations.map((rawRelation) => {
    const rawForm = rawRelation["name"];
    const pattern = (DATA.patterns as any)[rawForm] ?? null;
    return pattern;
  });
  const pattern = patterns.find((pattern) => pattern !== null) ?? null;
  return pattern;
}

function parseAffixesFromOtm(rawRelations: Array<any>): Array<string> {
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

function parseAffixesFromZpdic(rawRelations: Array<any>): Array<string> {
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

function calcRootCountFromOtm(rawWords: Array<any>): number {
  const roots = new Set<string>();
  for (const rawWord of rawWords) {
    const rawRelations = rawWord["relations"] as Array<any>;
    const rawRoot = rawRelations.filter((rawRelation) => rawRelation["title"] === "語根").map((rawRelation) => rawRelation["entry"]["form"])[0];
    if (rawRoot?.match(/^√(.+)-(.+)-(.+)$/)) {
      roots.add(rawRoot);
    }
  }
  return roots.size;
}

function calcRootCountFromZpdic(rawWords: Array<any>): number {
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

function calcWordCountFromOtm(rawWords: Array<any>): number {
  const otherCount = rawWords.filter((rawWord) => rawWord["tags"].includes("語根") || rawWord["tags"].includes("語型") || rawWord["tags"].includes("語型接辞")).length;
  const wordCount = rawWords.length - otherCount;
  return wordCount;
}

function calcWordCountFromZpdic(rawWords: Array<any>): number {
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
/* eslint-disable @typescript-eslint/naming-convention */

import {Word, convertWord} from "ogorasso";


export interface Dictionary {

  readonly words: Array<Word>;
  readonly rootCount: number;
  readonly wordCount: number;

}


const API_URLS = {
  zpdic: "https://zpdic.ziphil.com/api/v0/dictionary/fennese/words",
  google: "https://script.google.com/macros/s/AKfycbxsOZxTOmlYYrr6Mfw5n0_ZevxblJYQB42nBcswi1oVY-l__w_i8KmhMZFvTlI5pLVA/exec"
};

export async function getDictionary(): Promise<Dictionary> {
  const params = new URLSearchParams(window.location.search);
  const apiKey = params.get("key");
  const rawWords = (!!apiKey) ? await fetchRawWordsFromApi(apiKey) : await fetchRawWordsFromFile();
  const words = rawWords.map(convertWord);
  const rootCount = words.filter((word) => word.kind === "root" && !word.foreign).length;
  const wordCount = words.filter((word) => word.kind === "normal").length;
  console.log(`Words fetched from api: ${rootCount} roots, ${wordCount} words`);
  return {words, rootCount, wordCount};
}

export async function fetchRawWordsFromApi(apiKey: string): Promise<Array<any>> {
  const fetchRawWords = async function (page: number): Promise<[Array<any>, number]> {
    const response = await fetch(`${API_URLS.zpdic}?text=&skip=${page * 100}&limit=100`, {headers: {"X-Api-Key": apiKey}});
    const json = await response.json();
    return [json["words"], json["total"]];
  };
  const [firstRawWords, total] = await fetchRawWords(0);
  const lastRawWords = await Promise.all(Array.from({length: Math.floor((total - 1) / 100)}, async (dummy, index) => {
    const [lastRawWords] = await fetchRawWords(index + 1);
    return lastRawWords;
  }));
  const rawWords = [...firstRawWords, ...lastRawWords.flat()];
  return rawWords;
}

export async function fetchRawWordsFromFile(): Promise<Array<any>> {
  const response = await fetch(API_URLS.google);
  const json = await response.json();
  return json["words"];
}
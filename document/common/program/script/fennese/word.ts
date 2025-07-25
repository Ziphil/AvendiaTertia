/* eslint-disable @typescript-eslint/naming-convention */

import {Word, convertWord} from "ogorasso";


export interface Dictionary {

  readonly words: Array<Word>;
  readonly rootCount: number;
  readonly wordCount: number;

}


const API_URLS = {
  zpdic: "https://zpdic.ziphil.com/api/v0/dictionary/fennese/words",
  google: "https://script.google.com/macros/s/AKfycbxXib3bXPFx0eYP_No0Kb2YVtFriB6t2KGqiRnLoeIx3DRtcgjpBbf5aWgN0Vhmqg/exec"
};

export async function getDictionary(): Promise<Dictionary> {
  const params = new URLSearchParams(window.location.search);
  const apiKey = params.get("key");
  const fetchRawWords = async function (page: number): Promise<[Array<any>, number]> {
    const response = (!!apiKey)
      ? await fetch(`${API_URLS.zpdic}?text=&skip=${page * 100}&limit=100`, {headers: {"X-Api-Key": apiKey}})
      : await fetch(`${API_URLS.google}?text=&skip=${page * 100}&limit=100`);
    const json = await response.json();
    return [json["words"], json["total"]];
  };
  const [firstRawWords, total] = await fetchRawWords(0);
  const lastRawWords = await Promise.all(Array.from({length: Math.floor((total - 1) / 100)}, async (dummy, index) => {
    const [lastRawWords] = await fetchRawWords(index + 1);
    return lastRawWords;
  }));
  const rawWords = [...firstRawWords, ...lastRawWords.flat()];
  const words = rawWords.map(convertWord);
  const rootCount = words.filter((word) => word.kind === "root").length;
  const wordCount = words.filter((word) => word.kind === "normal").length;
  console.log(`Words fetched from api: ${rootCount} roots, ${wordCount} words`);
  return {words, rootCount, wordCount};
}
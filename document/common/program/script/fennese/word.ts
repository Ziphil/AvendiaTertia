/* eslint-disable @typescript-eslint/naming-convention */

import {Entry, convertEntry} from "ogorasso";


export interface Dictionary {

  readonly entries: Array<Entry>;
  readonly rootCount: number;
  readonly wordCount: number;

}


const API_URLS = {
  zpdic: "https://zpdic.ziphil.com/api/v1/dictionary/fennese/words",
  google: "https://script.google.com/macros/s/AKfycbxsOZxTOmlYYrr6Mfw5n0_ZevxblJYQB42nBcswi1oVY-l__w_i8KmhMZFvTlI5pLVA/exec"
};

export async function getDictionary(): Promise<Dictionary> {
  const params = new URLSearchParams(window.location.search);
  const apiKey = params.get("key");
  const rawEntries = (!!apiKey) ? await fetchRawEntriesFromZpdic(apiKey) : await fetchRawEntriesFromGoogle();
  const entries = rawEntries.map(convertEntry);
  const rootCount = entries.filter((entry) => entry.kind === "root" && !entry.borrowed).length;
  const wordCount = entries.filter((entry) => entry.kind === "word").length;
  console.log(`Words fetched from api: ${rootCount} roots, ${wordCount} words`);
  console.log(entries);
  return {entries, rootCount, wordCount};
}

export async function fetchRawEntriesFromZpdic(apiKey: string): Promise<Array<any>> {
  const fetchRawEntries = async function (page: number): Promise<[Array<any>, number]> {
    const response = await fetch(`${API_URLS.zpdic}?text=&skip=${page * 100}&limit=100`, {headers: {"X-Api-Key": apiKey}});
    const json = await response.json();
    return [json["words"], json["total"]];
  };
  const [firstRawEntries, total] = await fetchRawEntries(0);
  const lastRawEntries = await Promise.all(Array.from({length: Math.floor((total - 1) / 100)}, async (dummy, index) => {
    const [lastRawEntries] = await fetchRawEntries(index + 1);
    return lastRawEntries;
  }));
  const rawEntries = [...firstRawEntries, ...lastRawEntries.flat()];
  return rawEntries;
}

export async function fetchRawEntriesFromGoogle(): Promise<Array<any>> {
  const response = await fetch(API_URLS.google);
  const json = await response.json();
  return json["words"];
}
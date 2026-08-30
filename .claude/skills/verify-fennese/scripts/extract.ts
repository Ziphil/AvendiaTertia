//

import {DOMImplementation} from "@zenml/xmldom";
import {ZenmlParser, ZenmlPluginManager} from "@zenml/zenml";
import fs from "fs";
import pathUtil from "path";


const REPOSITORY_ROOT_PATH = pathUtil.resolve(__dirname, "..", "..", "..", "..");

export const SENTENCE_LIST_TAG_NAMES = ["xl", "xol"] as const;

function main(): void {
  const commandArgs = process.argv.slice(2);
  const inputPaths = [] as Array<string>;
  let lineRange = null as LineRange | null;
  let format = "json";
  for (let index = 0 ; index < commandArgs.length ; index ++) {
    const commandArg = commandArgs[index];
    if (commandArg === "--lines") {
      lineRange = parseLineRange(commandArgs[++ index]);
    } else if (commandArg === "--format") {
      format = commandArgs[++ index];
    } else if (commandArg.startsWith("--")) {
      console.error("不明なオプション: " + commandArg);
      process.exit(1);
    } else {
      inputPaths.push(commandArg);
    }
  }
  if (inputPaths.length > 0) {
    const parser = createParser();
    const sentences = [] as Array<Sentence>;
    for (const filePath of collectFilePaths(inputPaths)) {
      sentences.push(...extractSentences(filePath, parser, lineRange));
    }
    sentences.forEach((sentence, index) => {
      sentence.id = index + 1;
    });
    if (format === "json") {
      process.stdout.write(JSON.stringify({count: sentences.length, sentences}, null, 2) + "\n");
    } else {
      for (const sentence of sentences) {
        process.stdout.write(formatSentence(sentence));
      }
    }
  } else {
    console.error("使い方: npx tsx extract.ts <パス> [...] [--lines A-B] [--format json|text]");
    process.exit(1);
  }
}

export type LineRange = [number, number];

function parseLineRange(text: string): LineRange {
  if (text.includes("-")) {
    const [start, end] = text.split("-", 2);
    return [(start !== "") ? parseInt(start, 10) : 1, (end !== "") ? parseInt(end, 10) : Number.MAX_SAFE_INTEGER];
  } else {
    const value = parseInt(text, 10);
    return [value, value];
  }
}

/** ZenML パーサを通常の変換時と同じ設定で作ります。 */
export function createParser(): ZenmlParser {
  const options = {specialElementNames: {brace: "x", bracket: "xn", slash: "i"}};
  const parser = new ZenmlParser(new DOMImplementation(), options);
  try {
    installRepositoryRootAlias();
    const pluginManagers = require(pathUtil.join(REPOSITORY_ROOT_PATH, "plugin")).default as Array<ZenmlPluginManager>;
    for (const pluginManager of pluginManagers) {
      parser.registerPluginManager(pluginManager);
    }
  } catch (error) {
    console.error("警告: `plugin/` を読み込めませんでした。マクロを含むファイルはパースに失敗します。");
    console.error(String(error).split("\n")[0]);
  }
  return parser;
}

/** `plugin/` 以下は `~/…` という webpack のエイリアスで自分自身内のファイルを参照しているので、`tsx` コマンドから読み込めるように解決を差し込みます。*/
function installRepositoryRootAlias(): void {
  const moduleClass = require("module") as any;
  const resolveFilename = moduleClass["_resolveFilename"];
  moduleClass["_resolveFilename"] = function (request: string, ...rests: Array<any>): string {
    const nextRequest = (request.startsWith("~/")) ? pathUtil.join(REPOSITORY_ROOT_PATH, request.substring(2)) : request;
    return resolveFilename.call(this, nextRequest, ...rests);
  };
}

export function collectFilePaths(inputPaths: ReadonlyArray<string>): Array<string> {
  const filePaths = [] as Array<string>;
  for (const inputPath of inputPaths) {
    if (fs.existsSync(inputPath) && fs.statSync(inputPath).isDirectory()) {
      const entries = fs.readdirSync(inputPath, {withFileTypes: true}).sort((first, second) => first.name.localeCompare(second.name));
      for (const entry of entries) {
        const childPath = pathUtil.join(inputPath, entry.name);
        if (entry.isDirectory()) {
          filePaths.push(...collectFilePaths([childPath]));
        } else if (entry.name.endsWith(".zml")) {
          filePaths.push(childPath);
        }
      }
    } else {
      filePaths.push(inputPath);
    }
  }
  return filePaths;
}

export type Sentence = {
  id?: number,
  filePath: string,
  fennese: string,
  japanese: string | null
};

export function extractSentences(filePath: string, parser: ZenmlParser, lineRange: LineRange | null): Array<Sentence> {
  const relativePath = pathUtil.relative(process.cwd(), filePath).split(pathUtil.sep).join("/");
  const source = fs.readFileSync(filePath, "utf-8").replace(/^﻿/, "");
  const document = parseDocument(parser, source, relativePath);
  const sentences = [] as Array<Sentence>;
  if (document !== null) {
    const listElements = collectListElements(document);
    const listOffsets = collectListOffsets(source);
    const offsetReliable = listOffsets.length === listElements.length;
    listElements.forEach((listElement, listIndex) => {
      const listLineNumber = (offsetReliable) ? getLineNumber(source, listOffsets[listIndex]) : 0;
      const inRange = lineRange === null || !offsetReliable || (listLineNumber >= lineRange[0] && listLineNumber <= lineRange[1]);
      if (inRange) {
        sentences.push(...extractSentencesFromListElement(listElement, relativePath));
      }
    });
  }
  return sentences;
}

function parseDocument(parser: ZenmlParser, source: string, label: string): Document | null {
  try {
    const document = parser.tryParse(source);
    return document;
  } catch (error) {
    console.error("パースに失敗しました: " + label);
    console.error(String(error).split("\n").slice(0, 3).join("\n"));
    return null;
  }
}

function collectListElements(node: Node, listElements: Array<Element> = []): Array<Element> {
  for (let index = 0 ; index < node.childNodes.length ; index ++) {
    const childNode = node.childNodes.item(index);
    if (childNode !== null && childNode.nodeType === 1) {
      const childElement = childNode as Element;
      if ((SENTENCE_LIST_TAG_NAMES as ReadonlyArray<string>).includes(childElement.tagName)) {
        listElements.push(childElement);
      }
      collectListElements(childElement, listElements);
    }
  }
  return listElements;
}

function collectListOffsets(source: string): Array<number> {
  const pattern = new RegExp("\\\\(?:" + SENTENCE_LIST_TAG_NAMES.join("|") + ")(?![A-Za-z0-9?_-])", "g");
  const listOffsets = [] as Array<number>;
  let match = pattern.exec(source);
  while (match !== null) {
    if (match.index <= 0 || source.charAt(match.index - 1) !== "`") {
      listOffsets.push(match.index);
    }
    match = pattern.exec(source);
  }
  return listOffsets;
}

function extractSentencesFromListElement(listElement: Element, filePath: string): Array<Sentence> {
  const sentences = [] as Array<Sentence>;
  for (const itemElement of getChildElements(listElement, "li")) {
    const fenneseElement = getChildElements(itemElement, "sh")[0];
    if (fenneseElement !== undefined && !fenneseElement.hasAttribute("mark")) {
      const fennese = normalizeSpaces(getText(fenneseElement));
      if (fennese !== "") {
        sentences.push(createSentence(itemElement, fennese, filePath));
      }
    }
  }
  return sentences;
}

function createSentence(itemElement: Element, fennese: string, filePath: string): Sentence {
  const japaneseElement = getChildElements(itemElement, "ja")[0];
  const japanese = (japaneseElement !== undefined) ? normalizeSpaces(getText(japaneseElement)) : "";
  return {
    filePath,
    fennese,
    japanese: (japanese === "") ? null : japanese,
  };
}

function formatSentence(sentence: Sentence): string {
  const head = "[" + sentence.id + "] " + sentence.filePath;
  return head + "\n  FE: " + sentence.fennese + "\n  JA: " + (sentence.japanese ?? "(訳文なし)") + "\n";
}

function getChildElements(element: Element, tagName: string): Array<Element> {
  const childElements = [] as Array<Element>;
  for (let index = 0 ; index < element.childNodes.length ; index ++) {
    const childNode = element.childNodes.item(index);
    if (childNode !== null && childNode.nodeType === 1) {
      const childElement = childNode as Element;
      if (tagName === undefined || childElement.tagName === tagName) {
        childElements.push(childElement);
      }
    }
  }
  return childElements;
}

function getText(node: Node): string {
  if (node.nodeType === 3 || node.nodeType === 4) {
    return node.nodeValue ?? "";
  } else if (node.nodeType === 1) {
    let text = "";
    const element = node as Element;
    if (element.tagName === "ch") {
      text = resolveCharacterText(element);
    } else {
      for (let index = 0 ; index < element.childNodes.length ; index ++) {
        const childNode = element.childNodes.item(index);
        if (childNode !== null) {
          text += getText(childNode);
        }
      }
    }
    return text;
  } else {
    return "";
  }
}

const DOZENAL_CHARS = new Map<string, string>([["x", "↊"], ["e", "↋"]]);

function resolveCharacterText(element: Element): string {
  if (element.hasAttribute("c")) {
    const codePoint = parseInt(element.getAttribute("c")!, 16);
    return (Number.isNaN(codePoint)) ? "" : String.fromCodePoint(codePoint);
  } else if (element.getAttribute("n") === "nbsp") {
    return " ";
  } else if (element.hasAttribute("ds")) {
    return "//";
  } else if (element.hasAttribute("dz")) {
    return DOZENAL_CHARS.get(element.getAttribute("dz")!) ?? "";
  } else {
    return "";
  }
}

function getLineNumber(source: string, offset: number): number {
  let lineNumber = 1;
  for (let index = 0 ; index < offset && index < source.length ; index ++) {
    if (source.charAt(index) === "\n") {
      lineNumber ++;
    }
  }
  return lineNumber;
}

function normalizeSpaces(text: string): string {
  return text.replace(/ /g, " ").replace(/\s+/g, " ").trim();
}

if (require.main === module) {
  main();
}

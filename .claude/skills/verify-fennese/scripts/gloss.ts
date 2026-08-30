//

import {spawnSync} from "child_process";
import fs from "fs";
import os from "os";
import pathUtil from "path";
import type {Sentence} from "./extract";


const LOOKUP_DIRECTORY_PATH = pathUtil.join(os.homedir(), ".claude", "skills", "fennese-dictionary", "scripts");

const PROPER_MARKS = ["‵"];
const APOSTROPHES = ["'", "’", "ʼ"];

function main(): void {
  const commandArgs = process.argv.slice(2);
  let inputPath = undefined as string | undefined;
  let format = "text";
  let withInflection = true;
  for (let index = 0 ; index < commandArgs.length ; index ++) {
    const commandArg = commandArgs[index];
    if (commandArg === "--input") {
      inputPath = commandArgs[++ index];
    } else if (commandArg === "--format") {
      format = commandArgs[++ index];
    } else if (commandArg === "--no-inflection") {
      withInflection = false;
    } else {
      console.error("不明なオプション: " + commandArg);
      process.exit(1);
    }
  }
  const rawInput = (inputPath !== undefined) ? fs.readFileSync(inputPath, "utf-8") : fs.readFileSync(0, "utf-8");
  const payload = JSON.parse(rawInput) as {sentences: Array<Sentence>} | Array<Sentence>;
  const sentences = (Array.isArray(payload)) ? payload : payload.sentences;
  const glossedSentences = glossSentences(sentences);
  if (format === "json") {
    process.stdout.write(JSON.stringify({count: glossedSentences.length, sentences: glossedSentences}, null, 2) + "\n");
  } else {
    for (const glossedSentence of glossedSentences) {
      process.stdout.write(formatGlossedSentence(glossedSentence, withInflection));
    }
    process.stdout.write(formatMissingWords(glossedSentences));
  }
}

type GlossedSentence = Sentence & {
  glosses: Array<Gloss>
};

type Token = {
  form: string,
  kind: "word" | "proper" | "numeric" | "latin" | "punctuation"
};
type Gloss = Token & {
  found?: boolean,
  response?: LookupResponse
};

function glossSentences(sentences: ReadonlyArray<Sentence>): Array<GlossedSentence> {
  const tokensBySentence = new Map<Sentence, Array<Token>>();
  const neededWords = [] as Array<string>;
  const seenWords = new Set<string>();
  for (const sentence of sentences) {
    const tokens = sentence.fennese.split(/\s+/).map(classifyToken).filter((token) => token.kind !== "punctuation");
    tokensBySentence.set(sentence, tokens);
    for (const token of tokens) {
      if (token.kind === "word" && !seenWords.has(token.form.toLowerCase())) {
        seenWords.add(token.form.toLowerCase());
        neededWords.push(token.form);
      }
    }
  }
  const responsesByWord = (neededWords.length > 0) ? lookupWords(neededWords) : new Map<string, LookupResponse>();
  const glossedSentences = sentences.map((sentence) => {
    const glosses = tokensBySentence.get(sentence)!.map((token) => {
      const gloss = {form: token.form, kind: token.kind} as Gloss;
      if (token.kind === "word") {
        const response = responsesByWord.get(token.form.toLowerCase());
        gloss.found = response !== undefined && response.found;
        gloss.response = response;
      }
      return gloss;
    });
    return {...sentence, glosses};
  });
  return glossedSentences;
}

const DOZENAL_CHARS = ["↊", "↋"];

/** フェンナ語の文を空白で区切ったそれぞれ (トークン) を分類します。
 * ここで決まった種類によって、そのトークンを辞書で引くかどうかが変わります。
 * 辞書を引くことになるのは `word` トークンのみです。
 * - `word` — 下記のどれにも当たらない文字を含むトークン
 * - `proper` — 固有名詞マーク `‵` の付いたトークン (出力には「スキップ」として残す)
 * - `numeric` — 数字を含むトークン。12 進法の `↊`, `↋` も数字として扱う (出力には「スキップ」として残す)
 * - `latin` — ラテン文字だけから成る単位や記号と見なすトークン (出力には「スキップ」として残す)
 * - `punctuation` — 文字を 1 つも含まない約物だけのトークン (呼び出し元で捨てられて出力にも現れない) */
function classifyToken(token: string): Token {
  const rawForm = token.trim();
  const coreForm = stripSurroundingPunctuation(rawForm);
  if (PROPER_MARKS.some((mark) => rawForm.includes(mark))) {
    return {form: rawForm, kind: "proper"};
  } else if (/[0-9]/.test(coreForm) || DOZENAL_CHARS.some((char) => coreForm.includes(char))) {
    return {form: coreForm, kind: "numeric"};
  } else if (/^[A-Za-z]+$/.test(coreForm)) {
    return {form: coreForm, kind: "latin"};
  } else if (/\p{L}/u.test(coreForm)) {
    return {form: coreForm, kind: "word"};
  } else {
    return {form: rawForm, kind: "punctuation"};
  }
}

function stripSurroundingPunctuation(token: string): string {
  const isStrippable = function (char: string): boolean {
    return /[\p{P}\p{S}]/u.test(char) && !APOSTROPHES.includes(char) && !DOZENAL_CHARS.includes(char);
  };
  let start = 0;
  let end = token.length;
  while (start < end && isStrippable(token.charAt(start))) {
    start ++;
  }
  while (end > start && isStrippable(token.charAt(end - 1))) {
    end --;
  }
  return token.substring(start, end);
}

type LookupResponse = {
  query: string,
  found: boolean,
  results?: Array<LookupMatchResult>
};
type LookupMatchResult = {
  matchType: string,
  matchedForm?: string,
  inflectionDescriptions?: Array<string>,
  word: Word
};

type Word = {
  number: number,
  spelling: string,
  sections: Array<{equivalents: Array<Equivalent>}>
}
type Equivalent = {
  titles: Array<string>,
  terms: Array<string>,
  termString: string,
  hidden: boolean
};

function lookupWords(words: ReadonlyArray<string>): Map<string, LookupResponse> {
  const responsesByWord = new Map<string, LookupResponse>();
  const plainWords = words.filter((word) => !hasApostrophe(word));
  const elidedWords = words.filter((word) => hasApostrophe(word));
  for (let start = 0 ; start < plainWords.length ; start += 200) {
    const chunkWords = plainWords.slice(start, start + 200);
    const payload = callLookupScript(["words", ...chunkWords]) as {queries: Array<string>, results: Array<LookupResponse>};
    if (payload.results.length === chunkWords.length) {
      chunkWords.forEach((word, index) => {
        responsesByWord.set(word.toLowerCase(), payload.results[index]);
      });
    } else {
      console.error("辞書引きの結果数が一致しません (" + chunkWords.length + " → " + payload.results.length + ")");
      process.exit(1);
    }
  }
  for (const word of elidedWords) {
    responsesByWord.set(word.toLowerCase(), callLookupScript(["word", word]) as LookupResponse);
  }
  return responsesByWord;
}

function callLookupScript(lookupArguments: ReadonlyArray<string>): unknown {
  const commandArgs = ["tsx", "lookup.ts", ...lookupArguments];
  const options = {cwd: LOOKUP_DIRECTORY_PATH, encoding: "utf-8", maxBuffer: 1 << 28} as const;
  let completed = spawnSync("npx", commandArgs, options);
  if (completed.error !== undefined && (completed.error as any).code === "ENOENT") {
    completed = spawnSync("npx", commandArgs, {...options, shell: true});
  }
  if (completed.status === 0 && completed.stdout !== null) {
    return JSON.parse(completed.stdout);
  } else {
    console.error(completed.stderr ?? completed.error);
    console.error("辞書引きに失敗しました (lookup.ts)");
    process.exit(1);
  }
}

function formatGlossedSentence(sentence: GlossedSentence, withInflection: boolean): string {
  const head = "[" + (sentence.id ?? "?") + "] " + sentence.filePath;
  const body = sentence.glosses.map((gloss) => formatGloss(gloss, withInflection)).join("");
  return head + "\n  FE: " + sentence.fennese + "\n  JA: " + (sentence.japanese ?? "(訳文なし)") + "\n" + body + "\n";
}

function formatGloss(gloss: Gloss, withInflection: boolean): string {
  let description = "";
  if (gloss.kind === "proper") {
    description = "— 固有名詞マーク付きのためスキップ";
  } else if (gloss.kind === "word") {
    description = describeLookupResult(gloss.response, withInflection);
  } else if (gloss.kind === "numeric") {
    description = "— 数字を含むためスキップ";
  } else {
    description = "— ラテン文字のみのためスキップ";
  }
  return "      " + padForm(gloss.form, 16) + description + "\n";
}

function describeLookupResult(result: LookupResponse | undefined, withInflection: boolean): string {
  if (result !== undefined && result.found && result.results !== undefined) {
    return result.results.map((match) => describeLookupMatchResult(match, withInflection)).join("  ///  ");
  } else {
    return "✗ 辞書になし";
  }
}

function describeLookupMatchResult(result: LookupMatchResult, withInflection: boolean): string {
  const senses = [] as Array<string>;
  for (const section of result.word.sections) {
    for (const equivalent of section.equivalents) {
      if (!equivalent.hidden) {
        const titles = equivalent.titles.join("・");
        const terms = equivalent.termString || equivalent.terms.join(", ");
        senses.push(((titles !== "") ? "[" + titles + "] " : "") + terms);
      }
    }
  }
  let description = result.word.spelling + " #" + result.word.number + " " + senses.join(" / ");
  if (result.matchType === "oldSpelling") {
    description += " (旧綴り)";
  }
  if (withInflection && result.inflectionDescriptions !== undefined && result.inflectionDescriptions.length > 0) {
    description += "  <" + result.inflectionDescriptions.join(" | ") + ">";
  }
  return description;
}

function formatMissingWords(sentences: ReadonlyArray<GlossedSentence>): string {
  const missingEntries = [] as Array<{form: string, sentence: GlossedSentence}>;
  for (const sentence of sentences) {
    for (const gloss of sentence.glosses) {
      if (gloss.kind === "word" && gloss.found !== true) {
        missingEntries.push({form: gloss.form, sentence});
      }
    }
  }
  if (missingEntries.length > 0) {
    const lines = missingEntries.map(({form, sentence}) => {
      return "  " + form + "  ([" + (sentence.id ?? "?") + "] " + sentence.filePath + ")\n";
    });
    return "=== 辞書に無い語 (" + missingEntries.length + " 件) ===\n" + lines.join("");
  } else {
    return "=== 辞書に無い語はありません ===\n";
  }
}

function hasApostrophe(word: string): boolean {
  return APOSTROPHES.some((apostrophe) => word.includes(apostrophe));
}

function padForm(form: string, width: number): string {
  const visibleLength = form.replace(/\p{Mn}/gu, "").length;
  return form + " ".repeat(Math.max(1, width - visibleLength));
}

if (require.main === module) {
  main();
}

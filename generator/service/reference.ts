//

import fs from "fs/promises";
import pathUtil from "path";
import {AvendiaOutputLanguage} from "../configs";
import type {AvendiaServiceArgs} from "./index";


const SECTION_TERM_INITIALS = {
  ja: [["あ", "あ行"], ["か", "か行"], ["さ", "さ行"], ["た", "た行"], ["な", "な行"], ["は", "は行"], ["ま", "ま行"], ["や", "や行"], ["ら", "ら行"], ["わ", "わ行"]],
  en: [["a", "A–D"], ["e", "E–H"], ["i", "I–L"], ["m", "M–P"], ["q", "Q–T"], ["u", "U–Z"]]
};
const ROOT_DOCUMENT_DIRS = [
  "shaleian/grammar",
  "fennese/grammar"
];

export default async function execute(outputLanguage: AvendiaOutputLanguage, args: AvendiaServiceArgs): Promise<void> {
  const outputPath = args.configs.getReferenceIndexPath("ja");
  const outputObjectEntries = await Promise.all(ROOT_DOCUMENT_DIRS.map(async (rootDocumentDir) => {
    const outputObject = await createReferenceIndex(rootDocumentDir, outputLanguage, args);
    return [rootDocumentDir, outputObject] as const;
  }));
  const outputObject = Object.fromEntries(outputObjectEntries);
  const outputString = JSON.stringify(outputObject, undefined, 2);
  await fs.mkdir(pathUtil.dirname(outputPath), {recursive: true});
  await fs.writeFile(outputPath, outputString, {encoding: "utf-8"});
}

async function createReferenceIndex(rootDocumentDir: string, outputLanguage: AvendiaOutputLanguage, args: AvendiaServiceArgs): Promise<ReferenceIndex> {
  const [sectionIndex, termIndex] = await Promise.all([
    createSectionIndex(rootDocumentDir, outputLanguage, args),
    createTermIndex(rootDocumentDir, outputLanguage, args)
  ]);
  return {section: sectionIndex, term: termIndex};
}

async function createSectionIndex(rootDocumentDir: string, outputLanguage: AvendiaOutputLanguage, args: AvendiaServiceArgs): Promise<ReferenceSectionIndex> {
  const specs = await iteratePages(rootDocumentDir, outputLanguage, args, (href) => createSectionSpecFromPage(rootDocumentDir, href, outputLanguage, args));
  const hrefs = Object.fromEntries(createSectionHrefEntries(specs));
  return {specs, hrefs};
}

async function createSectionSpecFromPage(rootDocumentDir: string, href: string, outputLanguage: AvendiaOutputLanguage, args: AvendiaServiceArgs): Promise<ReferenceSectionSpec> {
  const documentPath = args.configs.getDocumentDirPath(outputLanguage) + "/" + rootDocumentDir + "/" + href.replace(/\.html$/, ".zml");
  const initialVariables = {path: documentPath, language: outputLanguage};
  const inputString = await fs.readFile(documentPath, {encoding: "utf-8"});
  const inputDocument = args.parser.tryParse(inputString);
  const childSpecs = JSON.parse(args.transformer.transform(inputDocument, {initialScope: "reference-section", initialVariables}).toString().trim());
  const content = args.transformer.transform(inputDocument, {initialScope: "name", initialVariables}).toString().trim();
  const spec = {href, content, childSpecs, tag: ""};
  return spec;
}

function createSectionHrefEntries(specs: Array<ReferenceSectionSpec>): Array<[tag: string, href: string]> {
  const entries = [] as Array<[string, string]>;
  for (const spec of specs) {
    if (spec.tag !== "") {
      entries.push([spec.tag, spec.href]);
    }
    entries.push(...createSectionHrefEntries(spec.childSpecs));
  }
  return entries;
}

async function createTermIndex(rootDocumentDir: string, outputLanguage: AvendiaOutputLanguage, args: AvendiaServiceArgs): Promise<ReferenceTermIndex> {
  const specs = await iteratePages(rootDocumentDir, outputLanguage, args, (href) => createTermSpecsFromPage(rootDocumentDir, href, outputLanguage, args)).then((specs) => specs.flat());
  const initialedSpecs = createInitialedTermSpecs(specs, outputLanguage);
  return {specs: initialedSpecs};
}

async function createTermSpecsFromPage(rootDocumentDir: string, href: string, outputLanguage: AvendiaOutputLanguage, args: AvendiaServiceArgs): Promise<Array<ReferenceTermSpec>> {
  const documentPath = args.configs.getDocumentDirPath(outputLanguage) + "/" + rootDocumentDir + "/" + href.replace(/\.html$/, ".zml");
  const initialVariables = {path: documentPath, language: outputLanguage};
  const inputString = await fs.readFile(documentPath, {encoding: "utf-8"});
  const inputDocument = args.parser.tryParse(inputString);
  const specs = JSON.parse(args.transformer.transform(inputDocument, {initialScope: "reference-term", initialVariables}).toString().trim());
  return specs;
}

function createInitialedTermSpecs(specs: Array<ReferenceTermSpec>, outputLanguage: AvendiaOutputLanguage): Array<ReferenceInitialedTermSpec> {
  const initialedSpecs = [];
  let currentInitialedSpec = null as ReferenceInitialedTermSpec | null;
  let currentInitialIndex = 0;
  specs.sort((firstSpec, secondSpec) => firstSpec.key.localeCompare(secondSpec.key, outputLanguage));
  for (const spec of specs) {
    while (true) {
      const [currentInitialKey, currentInitialText] = SECTION_TERM_INITIALS[outputLanguage][currentInitialIndex];
      if (currentInitialKey !== undefined && spec.key.localeCompare(currentInitialKey, outputLanguage) >= 0) {
        if (currentInitialedSpec !== null) {
          initialedSpecs.push(currentInitialedSpec);
        }
        currentInitialedSpec = {key: currentInitialKey, text: currentInitialText, specs: []};
        currentInitialIndex ++;
      } else {
        break;
      }
    }
    currentInitialedSpec?.specs.push(spec);
  }
  if (currentInitialedSpec !== null && currentInitialedSpec.specs.length > 0) {
    initialedSpecs.push(currentInitialedSpec);
  }
  return initialedSpecs;
}

/** `rootDocumentDir` に指定されたフォルダの index ファイルを参照し、そこからリンクされている各ページに対して `operate` 関数を呼び出します。*/
async function iteratePages<T>(rootDocumentDir: string, outputLanguage: AvendiaOutputLanguage, args: AvendiaServiceArgs, operate: (href: string) => T | Promise<T>): Promise<Array<T>> {
  const documentPath = args.configs.getDocumentDirPath(outputLanguage) + "/" + rootDocumentDir + "/index.zml";
  const inputString = await fs.readFile(documentPath, {encoding: "utf-8"});
  const inputDocument = args.parser.tryParse(inputString);
  const indexElements = inputDocument.searchXpath("//ab") as Array<Element>;
  const filteredIndexElements = indexElements.filter((indexElement) => !indexElement.getAttribute("ignore"));
  const results = await Promise.all(filteredIndexElements.map(async (indexElement) => {
    const href = indexElement.getAttribute("href");
    const result = await operate(href);
    return result;
  }));
  return results;
}

export type ReferenceSectionSpec = {
  href: string,
  tag: string,
  content: string,
  childSpecs: Array<ReferenceSectionSpec>
};
export type ReferenceSectionIndex = {
  specs: Array<ReferenceSectionSpec>,
  hrefs: Record<string, string | undefined>
};

export type ReferenceTermSpec = {
  href: string,
  key: string,
  id: string,
  content: string
};
export type ReferenceInitialedTermSpec = {
  key: string,
  text: string,
  specs: Array<ReferenceTermSpec>
};
export type ReferenceTermIndex = {
  specs: Array<ReferenceInitialedTermSpec>
};

export type ReferenceIndex = {
  section: ReferenceSectionIndex,
  term: ReferenceTermIndex
};
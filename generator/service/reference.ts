//

import fs from "fs/promises";
import pathUtil from "path";
import {
  AvendiaOutputLanguage
} from "../configs";
import type {
  AvendiaServiceArgs
} from "./index";


const SECTION_TERM_INITIALS = {
  ja: [["あ", "あ行"], ["か", "か行"], ["さ", "さ行"], ["た", "た行"], ["な", "な行"], ["は", "は行"], ["ま", "ま行"], ["や", "や行"], ["ら", "ら行"], ["わ", "わ行"]],
  en: [["a", "A–D"], ["e", "E–H"], ["i", "I–L"], ["m", "M–P"], ["q", "Q–T"], ["u", "U–Z"]]
};

export default async function execute(outputLanguage: AvendiaOutputLanguage, args: AvendiaServiceArgs): Promise<void> {
  const outputPath = args.configs.getReferenceIndexPath("ja");
  const outputObject = {
    section: await createSectionIndex(outputLanguage, args),
    term: await createTermIndex(outputLanguage, args)
  };
  const outputString = JSON.stringify(outputObject, undefined, 2);
  await fs.mkdir(pathUtil.dirname(outputPath), {recursive: true});
  await fs.writeFile(outputPath, outputString, {encoding: "utf-8"});
}

async function createSectionIndex(outputLanguage: AvendiaOutputLanguage, args: AvendiaServiceArgs): Promise<ReferenceIndex["section"]> {
  const specs = await iteratePages(outputLanguage, args, (href) => createSectionSpecFromPage(href, outputLanguage, args));
  const hrefs = Object.fromEntries(createSectionHrefEntries(specs));
  return {specs, hrefs};
}

async function createSectionSpecFromPage(href: string, outputLanguage: AvendiaOutputLanguage, args: AvendiaServiceArgs): Promise<ReferenceSectionSpec> {
  const documentPath = args.configs.getDocumentDirPath(outputLanguage) + "/conlang/reference/" + href.replace(/\.html$/, ".zml");
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

async function createTermIndex(outputLanguage: AvendiaOutputLanguage, args: AvendiaServiceArgs): Promise<ReferenceIndex["term"]> {
  const specs = await iteratePages(outputLanguage, args, (href) => createTermSpecsFromPage(href, outputLanguage, args)).then((specs) => specs.flat());
  const initialedSpecs = createInitialedTermSpecs(specs, outputLanguage);
  return {specs: initialedSpecs};
}

async function createTermSpecsFromPage(href: string, outputLanguage: AvendiaOutputLanguage, args: AvendiaServiceArgs): Promise<Array<ReferenceTermSpec>> {
  const documentPath = args.configs.getDocumentDirPath(outputLanguage) + "/conlang/reference/" + href.replace(/\.html$/, ".zml");
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
  return initialedSpecs;
}

async function iteratePages<T>(outputLanguage: AvendiaOutputLanguage, args: AvendiaServiceArgs, operate: (href: string) => T | Promise<T>): Promise<Array<T>> {
  const documentPath = args.configs.getDocumentDirPath(outputLanguage) + "/conlang/reference/index.zml";
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

export type ReferenceIndex = {
  section: {
    specs: Array<ReferenceSectionSpec>,
    hrefs: Record<string, string | undefined>
  },
  term: {
    specs: Array<ReferenceInitialedTermSpec>
  }
};
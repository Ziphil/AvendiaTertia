//

import fs from "fs/promises";
import pathUtil from "path";
import {
  AvendiaOutputLanguage
} from "../configs";
import type {
  AvendiaServiceArgs
} from "./index";


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
  const specs = await iteratePages(outputLanguage, args, (href) => createSectionSpec(href, outputLanguage, args));
  const hrefs = Object.fromEntries(createSectionHrefEntries(specs));
  return {specs, hrefs};
}

async function createSectionSpec(href: string, outputLanguage: AvendiaOutputLanguage, args: AvendiaServiceArgs): Promise<ReferenceSectionSpec> {
  const documentPath = args.configs.getDocumentDirPath(outputLanguage) + "/conlang/reference/" + href.replace(/\.html$/, ".zml");
  const initialVariables = {path: documentPath, language: outputLanguage};
  const inputString = await fs.readFile(documentPath, {encoding: "utf-8"});
  const inputDocument = args.parser.tryParse(inputString);
  const childSpecs = JSON.parse(args.transformer.transform(inputDocument, {initialScope: "reference", initialVariables}).toString().trim());
  const content = args.transformer.transform(inputDocument, {initialScope: "name", initialVariables}).toString().trim();
  const documentSpec = {href, content, childSpecs, tag: ""};
  return documentSpec;
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
  const specs = [] as Array<{}>;
  const hrefs = {};
  return {specs, hrefs};
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
};
export type ReferenceIndex = {
  section: {
    specs: Array<ReferenceSectionSpec>,
    hrefs: Record<string, string | undefined>
  },
  term: {
    specs: Array<ReferenceTermSpec>,
    hrefs: Record<string, string | undefined>
  }
};
//

import {
  ZenmlParser
} from "@zenml/zenml";
import fs from "fs/promises";
import pathUtil from "path";
import {
  AvendiaConfigs,
  AvendiaOutputLanguage
} from "../configs";
import {
  AvendiaTransformer
} from "../transformer";


export default async function execute(outputLanguage: AvendiaOutputLanguage, args: AvendaServiceArgs): Promise<void> {
  const documentPath = args.configs.getDocumentDirPath(outputLanguage) + "/conlang/reference/index.zml";
  const outputPath = args.configs.getReferenceIndexPath("ja");
  const inputString = await fs.readFile(documentPath, {encoding: "utf-8"});
  const inputDocument = args.parser.tryParse(inputString);
  const indexElements = inputDocument.searchXpath("//ab") as Array<Element>;
  const filteredIndexElements = indexElements.filter((indexElement) => !indexElement.getAttribute("ignore"));
  const documentSpecs = await Promise.all(filteredIndexElements.map(async (indexElement) => {
    const href = indexElement.getAttribute("href");
    const documentSpec = await createSectionSpec(href, outputLanguage, args);
    return documentSpec;
  }));
  const hrefEntries = createHrefEntries(documentSpecs);
  const outputObject = {specs: documentSpecs, hrefs: Object.fromEntries(hrefEntries)};
  const outputString = JSON.stringify(outputObject, undefined, 2);
  await fs.mkdir(pathUtil.dirname(outputPath), {recursive: true});
  await fs.writeFile(outputPath, outputString, {encoding: "utf-8"});
}

async function createSectionSpec(href: string, outputLanguage: AvendiaOutputLanguage, args: AvendaServiceArgs): Promise<ReferenceSectionSpec> {
  const documentPath = args.configs.getDocumentDirPath(outputLanguage) + "/conlang/reference/" + href.replace(/\.html$/, ".zml");
  const initialVariables = {path: documentPath, language: outputLanguage};
  const inputString = await fs.readFile(documentPath, {encoding: "utf-8"});
  const inputDocument = args.parser.tryParse(inputString);
  const childSpecs = JSON.parse(args.transformer.transform(inputDocument, {initialScope: "reference", initialVariables}).toString().trim());
  const content = args.transformer.transform(inputDocument, {initialScope: "name", initialVariables}).toString().trim();
  const documentSpec = {href, content, childSpecs, tag: ""};
  return documentSpec;
}

function createHrefEntries(sectionSpecs: Array<ReferenceSectionSpec>): Array<[tag: string, href: string]> {
  const entries = [] as Array<[string, string]>;
  for (const sectionSpec of sectionSpecs) {
    if (sectionSpec.tag !== "") {
      entries.push([sectionSpec.tag, sectionSpec.href]);
    }
    entries.push(...createHrefEntries(sectionSpec.childSpecs));
  }
  return entries;
}

export type ReferenceSectionSpec = {
  href: string,
  tag: string,
  content: string,
  childSpecs: Array<ReferenceSectionSpec>
};
export type ReferenceIndex = {
  specs: Array<ReferenceSectionSpec>,
  hrefs: Record<string, string | undefined>
};
type AvendaServiceArgs = {
  parser: ZenmlParser,
  transformer: AvendiaTransformer,
  configs: AvendiaConfigs
};
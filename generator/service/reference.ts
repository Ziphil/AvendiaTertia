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
  AvendiaText
} from "../dom";
import {
  AvendiaTransformer
} from "../transformer";


export default async function execute(outputLanguage: AvendiaOutputLanguage, args: AvendaServiceArgs): Promise<void> {
  let documentPath = args.configs.getDocumentDirPath(outputLanguage) + "/conlang/reference/index.zml";
  let outputPath = args.configs.getReferenceIndexPath("ja");
  let inputString = await fs.readFile(documentPath, {encoding: "utf-8"});
  let inputDocument = args.parser.tryParse(inputString);
  let indexElements = inputDocument.searchXpath("//ab") as Array<Element>;
  let filteredIndexElements = indexElements.filter((indexElement) => !indexElement.getAttribute("ignore"));
  let promises = filteredIndexElements.map(async (indexElement) => {
    let href = indexElement.getAttribute("href");
    let documentSpec = await createSectionSpecs(href, outputLanguage, args);
    return documentSpec;
  });
  let documentSpecs = await Promise.all(promises);
  let hrefEntries = createHrefEntries(documentSpecs);
  let outputObject = {specs: documentSpecs, hrefs: Object.fromEntries(hrefEntries)};
  let outputString = JSON.stringify(outputObject, undefined, 2);
  await fs.mkdir(pathUtil.dirname(outputPath), {recursive: true});
  await fs.writeFile(outputPath, outputString, {encoding: "utf-8"});
}

async function createSectionSpecs(href: string, outputLanguage: AvendiaOutputLanguage, args: AvendaServiceArgs): Promise<ReferenceSectionSpec> {
  let documentPath = args.configs.getDocumentDirPath(outputLanguage) + "/conlang/reference/" + href.replace(/\.html$/, ".zml");
  let initialVariables = {path: documentPath, language: outputLanguage};
  let inputString = await fs.readFile(documentPath, {encoding: "utf-8"});
  let inputDocument = args.parser.tryParse(inputString);
  let childSpecs = JSON.parse(args.transformer.transform(inputDocument, {initialScope: "reference", initialVariables}).toString().trim());
  let content = args.transformer.transform(inputDocument, {initialScope: "name", initialVariables}).toString().trim();
  let documentSpec = {href, content, childSpecs, tag: ""};
  return documentSpec;
}

function createHrefEntries(sectionSpecs: Array<ReferenceSectionSpec>): Array<[tag: string, href: string]> {
  const entries = [] as Array<[string, string]>;
  for (let sectionSpec of sectionSpecs) {
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
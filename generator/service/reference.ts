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
  let outputString = JSON.stringify(documentSpecs, undefined, 2);
  await fs.mkdir(pathUtil.dirname(outputPath), {recursive: true});
  await fs.writeFile(outputPath, outputString, {encoding: "utf-8"});
}

async function createSectionSpecs(href: string, outputLanguage: AvendiaOutputLanguage, args: AvendaServiceArgs): Promise<SectionSpec> {
  let documentPath = args.configs.getDocumentDirPath(outputLanguage) + "/conlang/reference/" + href.replace(/\.html$/, ".zml");
  let initialVariables = {path: documentPath, language: outputLanguage};
  let inputString = await fs.readFile(documentPath, {encoding: "utf-8"});
  let inputDocument = args.parser.tryParse(inputString);
  let childSpecs = (() => {
    let outputDocument = args.transformer.transform(inputDocument, {initialScope: "reference", initialVariables}) as any;
    let outputText = outputDocument.fragment.nodes[0] as AvendiaText;
    outputText.options.raw = true;
    let sectionSpecs = JSON.parse(outputText.toString().trim());
    return sectionSpecs;
  })();
  let content = (() => {
    let outputDocument = args.transformer.transform(inputDocument, {initialScope: "name", initialVariables});
    let content = outputDocument.toString().trim();
    return content;
  })();
  let documentSpec = {href, content, childSpecs, tag: ""};
  return documentSpec;
}

export type SectionSpec = {
  href: string,
  tag: string,
  content: string,
  childSpecs: Array<SectionSpec>
};
type AvendaServiceArgs = {
  parser: ZenmlParser,
  transformer: AvendiaTransformer,
  configs: AvendiaConfigs
};
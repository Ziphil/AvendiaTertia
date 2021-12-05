//

import {
  DOMImplementation
} from "@zenml/xmldom";
import {
  ZenmlParser
} from "@zenml/zenml";
import {
  promises as fs
} from "fs";
import pathUtil from "path";
import {
  AVENDIA_CONFIGS,
  AvendiaLanguage,
  AvendiaOutputLanguage
} from "./configs";
import {
  AvendiaDocument
} from "./dom";
import {
  AvendiaTransformer
} from "./transformer";


export class AvendiaConverter {

  private documentPathSpecs: PathSpecs<AvendiaLanguage>;
  private parser: ZenmlParser;
  private transformer: AvendiaTransformer;

  public constructor() {
    this.documentPathSpecs = [["./document/ja/diary/index.zml", "ja"]];
    this.parser = this.createParser();
    this.transformer = this.createTransformer();
  }

  public async execute(): Promise<void> {
    await this.executeNormal();
  }

  public async executeNormal(): Promise<void> {
    let promises = this.documentPathSpecs.map(async ([documentPath, documentLanguage]) => {
      await this.saveNormal(documentPath, documentLanguage);
    });
    await Promise.all(promises);
  }

  private async saveNormal(documentPath: string, documentLanguage: AvendiaLanguage): Promise<void> {
    try {
      await this.convertNormal(documentPath, documentLanguage);
      await this.uploadNormal(documentPath, documentLanguage);
    } catch (error) {
      console.log(error);
    }
  }

  private async convertNormal(documentPath: string, documentLanguage: AvendiaLanguage): Promise<void> {
    let extension = pathUtil.extname(documentPath).slice(1);
    let outputPathSpecs = this.getOutputPathSpecs(documentPath, documentLanguage);
    let promises = outputPathSpecs.map(async ([outputPath, outputLanguage]) => {
      if (extension === "zml") {
        let variables = {path: documentPath, language: outputLanguage};
        let inputString = await fs.readFile(documentPath, {encoding: "utf-8"});
        let inputDocument = this.parser.tryParse(inputString);
        let outputString = this.transformer.transformFinalize(inputDocument, variables);
        await fs.mkdir(pathUtil.dirname(outputPath), {recursive: true});
        await fs.writeFile(outputPath, outputString, {encoding: "utf-8"});
      } else {
        throw new Error("Unknown file type");
      }
    });
    await Promise.all(promises);
  }

  private async uploadNormal(documentPath: string, documentLanguage: AvendiaLanguage): Promise<void> {
  }

  private createParser(): ZenmlParser {
    let implementation = new DOMImplementation();
    let parser = new ZenmlParser(implementation, {specialElementNames: {brace: "x", bracket: "xn", slash: "i"}});
    return parser;
  }

  private createTransformer(): AvendiaTransformer {
    let transformer = new AvendiaTransformer(() => new AvendiaDocument({includeDeclaration: false}));
    transformer.regsiterTemplateManager(require("../template/common").default);
    transformer.regsiterTemplateManager(require("../template/content-index").default);
    transformer.regsiterTemplateManager(require("../template/fallback").default);
    return transformer;
  }

  private getOutputPathSpecs(documentPath: string, documentLanguage: AvendiaLanguage): PathSpecs<AvendiaOutputLanguage> {
    let pathSpecs = [];
    let getOutputPathSpec = function (outputLanguage: AvendiaOutputLanguage): PathSpec<AvendiaOutputLanguage> {
      let outputPath = AVENDIA_CONFIGS.replaceDocumentDirPath(documentPath, documentLanguage, outputLanguage);
      outputPath = outputPath.replace(/\.zml$/, ".html");
      outputPath = outputPath.replace(/\.scss$/, ".css");
      outputPath = outputPath.replace(/\.tsx?$/, ".js");
      return [outputPath, outputLanguage];
    };
    if (documentLanguage === "common") {
      pathSpecs.push(getOutputPathSpec("ja"));
      pathSpecs.push(getOutputPathSpec("en"));
    } else {
      pathSpecs.push(getOutputPathSpec(documentLanguage));
    }
    return pathSpecs;
  }

}


type PathSpec<L> = [string, L];
type PathSpecs<L> = Array<PathSpec<L>>;
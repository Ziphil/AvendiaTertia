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

  private pathSpecs: PathSpecs<AvendiaLanguage>;
  private parser: ZenmlParser;
  private transformer: AvendiaTransformer;

  public constructor() {
    this.pathSpecs = [["./document/ja/diary/index.zml", "ja"]];
    this.parser = this.createParser();
    this.transformer = this.createTransformer();
  }

  public async execute(): Promise<void> {
    await this.executeNormal();
  }

  public async executeNormal(): Promise<void> {
    let promises = this.pathSpecs.map(async ([path, language]) => {
      await this.saveNormal(path, language);
    });
    await Promise.all(promises);
  }

  private async saveNormal(path: string, language: AvendiaLanguage): Promise<void> {
    try {
      await this.convertNormal(path, language);
      await this.uploadNormal(path, language);
    } catch (error) {
      console.log(error);
    }
  }

  private async convertNormal(path: string, language: AvendiaLanguage): Promise<void> {
    let extension = pathUtil.extname(path).slice(1);
    let outputPathSpecs = this.getOutputPathSpecs(path, language);
    let promises = outputPathSpecs.map(async ([outputPath, outputLanguage]) => {
      if (extension === "zml") {
        let variables = {path, language, outputPath, outputLanguage};
        let inputString = await fs.readFile(path, {encoding: "utf-8"});
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

  private async uploadNormal(path: string, language: AvendiaLanguage): Promise<void> {
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

  private getOutputPathSpecs(path: string, language: AvendiaLanguage): PathSpecs<AvendiaOutputLanguage> {
    let pathSpecs = [] as PathSpecs<AvendiaOutputLanguage>;
    let getOutputPath = function (outputLanguage: AvendiaOutputLanguage): string {
      let outputPath = AVENDIA_CONFIGS.replaceDocumentDirPath(path, language, outputLanguage);
      outputPath = outputPath.replace(/\.zml$/, ".html");
      outputPath = outputPath.replace(/\.scss$/, ".css");
      outputPath = outputPath.replace(/\.tsx?$/, ".js");
      return outputPath;
    };
    if (language === "common") {
      pathSpecs.push([getOutputPath("ja"), "ja"]);
      pathSpecs.push([getOutputPath("en"), "en"]);
    } else {
      pathSpecs.push([getOutputPath(language), language]);
    }
    return pathSpecs;
  }

}


type PathSpecs<L> = Array<[string, L]>;
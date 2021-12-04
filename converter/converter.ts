//

import {
  DOMImplementation
} from "@zenml/xmldom";
import {
  DocumentTransformer,
  ZenmlParser
} from "@zenml/zenml";
import {
  promises as fs
} from "fs";
import pathUtil from "path";
import AVENDIA_CONFIG_JSON from "../config/config.json";
import {
  AvendiaConfigs
} from "./configs";
import {
  AvendiaDocument
} from "./dom";


export class AvendiaConverter {

  private configs: AvendiaConfigs;
  private pathSpecs: Array<[string, AvendiaLanguage]>;
  private parser: ZenmlParser;
  private transformer: DocumentTransformer<AvendiaDocument>;

  public constructor() {
    this.configs = new AvendiaConfigs(AVENDIA_CONFIG_JSON);
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
    let extension = path.split(".").pop();
    let outputPathSpecs = this.getOutputPathSpecs(path, language);
    let promises = outputPathSpecs.map(async ([outputPath, outputLanguage]) => {
      if (extension === "zml") {
        let input = await fs.readFile(path, {encoding: "utf-8"});
        let inputDocument = this.parser.tryParse(input);
        let outputDocument = this.transformer.transform(inputDocument);
        await fs.mkdir(pathUtil.dirname(outputPath), {recursive: true});
        await fs.writeFile(outputPath, outputDocument.toString(), {encoding: "utf-8"});
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

  private createTransformer(): DocumentTransformer<AvendiaDocument> {
    let transformer = new DocumentTransformer(() => new AvendiaDocument({includeDeclaration: false}));
    transformer.regsiterTemplateManager(require("../template/common").default);
    transformer.regsiterTemplateManager(require("../template/content-index").default);
    transformer.regsiterTemplateManager(require("../template/fallback").default);
    return transformer;
  }

  private getOutputPathSpecs(path: string, language: AvendiaLanguage): Array<[string, AvendiaLanguage]> {
    let pathSpecs = [] as Array<[string, AvendiaLanguage]>;
    let configs = this.configs;
    let getOutputPath = function (outputLanguage: Exclude<AvendiaLanguage, "common">): string {
      let outputPath = pathUtil.join(configs.getOutputPath(outputLanguage), pathUtil.relative(configs.getDocumentPath(language), path));
      outputPath = outputPath.replace(/\.zml$/, ".html");
      outputPath = outputPath.replace(/\.scss$/, ".css");
      outputPath = outputPath.replace(/\.tsx?$/, ".js");
      return outputPath;
    };
    if (language === "common") {
      pathSpecs.push([getOutputPath("ja"), language]);
      pathSpecs.push([getOutputPath("en"), language]);
    } else {
      pathSpecs.push([getOutputPath(language), language]);
    }
    return pathSpecs;
  }

}


export type AvendiaLanguage = "ja" | "en" | "common";
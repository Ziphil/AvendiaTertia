//

import pathUtil from "path";


export class AvendiaConfigs {

  private readonly json: AvendiaConfigsJson;

  public constructor(json: AvendiaConfigsJson) {
    this.json = json;
  }

  public getDocumentDirPath(language: AvendiaLanguage): string {
    return this.json.documentDirPath[language];
  }

  public getOutputDirPath(outputLanguage: AvendiaOutputLanguage): string {
    return this.json.outputDirPath[outputLanguage];
  }

  public replaceDocumentDirPath(path: string, language: AvendiaLanguage, outputLanguage: AvendiaOutputLanguage): string {
    return pathUtil.join(this.getOutputDirPath(outputLanguage), pathUtil.relative(this.getDocumentDirPath(language), path));
  }

}


export type AvendiaLanguage = "ja" | "en" | "common";
export type AvendiaOutputLanguage = Exclude<AvendiaLanguage, "common">;
export type AvendiaConfigsJson = typeof import("../config/default.json");
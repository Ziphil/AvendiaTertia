//

import type {
  AvendiaLanguage
} from "./converter";


export class AvendiaConfigs {

  private readonly json: AvendiaConfigsJson;

  public constructor(json: AvendiaConfigsJson) {
    this.json = json;
  }

  public getDocumentPath(language: AvendiaLanguage): string {
    return this.json["documentPath"][language];
  }

  public getOutputPath(language: Exclude<AvendiaLanguage, "common">): string {
    return this.json["outputPath"][language];
  }

}


export type AvendiaConfigsJson = typeof import("../config/default.json");
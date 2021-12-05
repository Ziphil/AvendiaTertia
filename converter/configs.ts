//

import pathUtil from "path";
import AVENDIA_CONFIGS_JSON from "../config/config.json";


export class AvendiaConfigs {

  private readonly json: AvendiaConfigsJson;

  public constructor(json: AvendiaConfigsJson) {
    this.json = json;
  }

  public getRemoteDomain(language: AvendiaOutputLanguage): string {
    return this.json.remoteDomain[language];
  }

  public getRemoteUrl(path: string, language: AvendiaOutputLanguage): string {
    let documentDirPath = this.getDocumentDirPath(language);
    let remoteDomain = this.getRemoteDomain(language);
    let remoteUrl = path.replace(documentDirPath, remoteDomain).replace(/\.zml$/, ".html");
    return remoteUrl;
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
export type AvendiaConfigsJson = typeof AVENDIA_CONFIGS_JSON;

export const AVENDIA_CONFIGS = new AvendiaConfigs(AVENDIA_CONFIGS_JSON);
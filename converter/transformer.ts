//

import {
  BaseTransformer,
  NodeLikeOf
} from "@zenml/zenml";
import dotjs from "dot";
import TEMPLATE_HTML from "../template/template.html";
import TRANSLATIONS from "../template/translations.json";
import {
  AVENDIA_CONFIGS,
  AvendiaOutputLanguage
} from "./configs";
import type {
  AvendiaDocument
} from "./dom";


export class AvendiaTransformer extends BaseTransformer<AvendiaDocument, {}, AvendiaTransformerVariables> {

  private template: (...args: Array<any>) => string;

  public constructor(implementation: () => AvendiaDocument) {
    super(implementation);
    this.template = dotjs.template(TEMPLATE_HTML, {...dotjs.templateSettings, strip: false});
  }

  public transformFinalize(input: Document, variables?: AvendiaTransformerVariables): string {
    let document = this.transform(input, variables);
    let view = {
      configs: this.configs,
      variables: this.variables,
      avendiaConfigs: AVENDIA_CONFIGS,
      translations: TRANSLATIONS,
      document
    };
    let output = this.template(view);
    return output;
  }

  protected resetConfigs(): void {
    this.configs = {};
  }

  protected resetVariables(variables?: AvendiaTransformerVariables): void {
    this.variables = variables ?? {path: "", language: "ja"};
  }

}


export type AvendiaTransformerVariables = {
  path: string,
  language: AvendiaOutputLanguage,
  foreignLanguage?: AvendiaOutputLanguage,
  title?: string,
  pageTitle?: string,
  articleType?: string,
  navigationNode?: NodeLikeOf<AvendiaDocument>,
  headerNode?: NodeLikeOf<AvendiaDocument>
};
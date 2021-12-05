//

import {
  DocumentTransformer
} from "@zenml/zenml";
import dotjs from "dot";
import TEMPLATE_HTML from "../template/template.html";
import TRANSLATIONS from "../template/translations.json";
import type {
  AvendiaLanguage
} from "./configs";
import type {
  AvendiaConverter
} from "./converter";
import type {
  AvendiaDocument
} from "./dom";


export class AvendiaTransformer extends DocumentTransformer<AvendiaDocument> {

  private converter!: AvendiaConverter;
  private template: (...args: Array<any>) => string;

  public constructor(implementation: () => AvendiaDocument) {
    super(implementation);
    this.template = dotjs.template(TEMPLATE_HTML, {...dotjs.templateSettings, strip: false});
  }

  public transformFinalize(input: Document, variables?: any): string {
    let document = this.transform(input, variables);
    let view = {
      configs: this.configs,
      variables: this.variables,
      document,
      translations: TRANSLATIONS
    };
    let output = this.template(view);
    return output;
  }

  protected resetConfigs(): void {
    this.configs = {};
  }

  protected resetVariables(variables?: any): void {
    this.variables = variables ?? {};
  }

  public setConverter(converter: AvendiaConverter): void {
    this.converter = converter;
  }

}
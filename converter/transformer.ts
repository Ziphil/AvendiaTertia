//

import {
  DocumentTransformer
} from "@zenml/zenml";
import dotjs from "dot";
import TEMPLATE_HTML from "../template/template.html";
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

  public transform(input: Document, path?: string, language?: AvendiaLanguage): AvendiaDocument {
    this.updateDocument();
    this.resetVariables(path, language);
    this.document.appendChild(this.apply(input, ""));
    return this.document;
  }

  public transformFinalize(input: Document, path?: string, language?: AvendiaLanguage): string {
    let document = this.transform(input, path, language);
    let view = {configs: this.configs, variables: this.variables, document};
    let output = this.template(view);
    return output;
  }

  protected resetConfigs(): void {
    this.configs = {};
  }

  protected resetVariables(path?: string, language?: AvendiaLanguage): void {
    this.variables = {path, language};
  }

  public setConverter(converter: AvendiaConverter): void {
    this.converter = converter;
  }

}
//

import {
  DocumentTransformer
} from "@zenml/zenml";
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

  public transform(input: Document, path?: string, language?: AvendiaLanguage): AvendiaDocument {
    this.updateDocument();
    this.resetVariables(path, language);
    this.document.appendChild(this.apply(input, ""));
    return this.document;
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
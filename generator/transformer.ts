//

import {
  BaseTransformer,
  BaseTransformerOptions,
  LightTransformer,
  NodeLikeOf,
  TemplateManager
} from "@zenml/zenml";
import {ZoticaResourceUtils} from "@zenml/zotica";
import dotjs from "dot";
import TEMPLATE_HTML from "../template/template.html";
import TRANSLATIONS from "../template/translations.json";
import {AvendiaConfigs, AvendiaOutputLanguage} from "./configs";
import type {AvendiaDocument} from "./dom";
import type {ReferenceIndex} from "./service/reference";


export class AvendiaTransformer extends BaseTransformer<AvendiaDocument, AvendiaTransformerEnvironments, AvendiaTransformerVariables> {

  private template: (...args: Array<any>) => string;

  public constructor(implementation: () => AvendiaDocument, options?: BaseTransformerOptions<AvendiaDocument, AvendiaTransformerEnvironments, AvendiaTransformerVariables>) {
    super(implementation, options);
    this.template = dotjs.template(TEMPLATE_HTML, {...dotjs.templateSettings, strip: false});
  }

  protected stringify(document: AvendiaDocument): string {
    if (this.variables.mode === "page") {
      const view = {
        environments: this.environments,
        variables: this.variables,
        translations: TRANSLATIONS,
        document
      };
      const output = this.template(view);
      return output;
    } else {
      document.options.includeDeclaration = true;
      const output = document.toString();
      return output;
    }
  }

  protected resetEnvironments(initialEnvironments?: Partial<AvendiaTransformerEnvironments>): void {
    this.environments = {
      configs: initialEnvironments?.configs!,
      mathStyleString: ZoticaResourceUtils.getStyleString("/material/font/math.otf"),
      mathScriptString: ZoticaResourceUtils.getScriptString(),
      referenceIndexes: new Map(),
      ...initialEnvironments
    };
  }

  protected resetVariables(initialVariables?: Partial<AvendiaTransformerVariables>): void {
    this.variables = {
      path: "",
      language: "ja",
      number: {theorem: 0, equation: 0, bibliography: 0},
      numbers: {theorem: new Map(), equation: new Map(), bibliography: new Map()},
      namePrefixes: {theorem: new Map(), equation: new Map(), bibliography: new Map()},
      ...initialVariables
    };
  }

}


export class AvendiaTemplateManager extends TemplateManager<AvendiaDocument, AvendiaTransformerEnvironments, AvendiaTransformerVariables> {

}


export type AvendiaLightTransformer = LightTransformer<AvendiaDocument, AvendiaTransformerEnvironments, AvendiaTransformerVariables>;

export type AvendiaTransformerEnvironments = {
  configs: AvendiaConfigs,
  mathStyleString: string,
  mathScriptString: string,
  referenceIndexes: Map<AvendiaOutputLanguage, Record<string, ReferenceIndex>>
};
export type AvendiaTransformerVariables = {
  path: string,
  language: AvendiaOutputLanguage,
  foreignLanguage?: AvendiaOutputLanguage,
  mode?: "page" | "html",
  title?: string,
  pageTitle?: string,
  scheme?: string,
  version?: string,
  latest?: boolean,
  navigationNode?: NodeLikeOf<AvendiaDocument>,
  headNode?: NodeLikeOf<AvendiaDocument>,
  number: {theorem: number, equation: number, bibliography: number},
  numbers: {theorem: Map<string, number>, equation: Map<string, number>, bibliography: Map<string, number>},
  namePrefixes: {theorem: Map<string, string | null>, equation: Map<string, string | null>, bibliography: Map<string, string | null>},
  numberPrefix?: string
};
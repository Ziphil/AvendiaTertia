//

import {
  TemplateManager
} from "@zenml/zenml";
import type {
  AvendiaDocument
} from "../converter/dom";
import type {
  AvendiaTransformerVariables
} from "../converter/transformer";
import TRANSLATIONS from "../template/translations.json";


let manager = new TemplateManager<AvendiaDocument, {}, AvendiaTransformerVariables>();

manager.registerElementRule("page", "", (transformer, document, element) => {
  console.log(transformer.variables.path, transformer.variables.language);
  let path = transformer.variables.path;
  let language = transformer.variables.language;
  let title = "no title";
  transformer.variables.foreignLanguage = (language === "ja") ? "en" : "ja";
  transformer.variables.title = title;
  transformer.variables.pageTitle = title + " — " + TRANSLATIONS.title[language];
  return transformer.apply(element, "page");
});

export default manager;
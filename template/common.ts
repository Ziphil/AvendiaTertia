//

import {
  DocumentTemplateManager
} from "@zenml/zenml";
import {
  AvendiaOutputLanguage
} from "../converter/configs";
import type {
  AvendiaDocument
} from "../converter/dom";
import TRANSLATIONS from "../template/translations.json";


let manager = new DocumentTemplateManager<AvendiaDocument>();

manager.registerElementRule("page", true, (transformer, document, element) => {
  console.log(transformer.variables.path, transformer.variables.language);
  let outputLanguage = transformer.variables.outputLanguage as AvendiaOutputLanguage;
  let title = "no title";
  transformer.variables.foreignLanguage = (outputLanguage === "ja") ? "en" : "ja";
  transformer.variables.title = title;
  transformer.variables.pageTitle = title + " — " + TRANSLATIONS.title[outputLanguage];
  return transformer.apply(element, "page");
});

export default manager;
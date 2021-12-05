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
  let path = transformer.variables.path;
  let language = transformer.variables.language as AvendiaOutputLanguage;
  let title = "no title";
  transformer.variables.foreignLanguage = (language === "ja") ? "en" : "ja";
  transformer.variables.title = title;
  transformer.variables.pageTitle = title + " — " + TRANSLATIONS.title[language];
  return transformer.apply(element, "page");
});

export default manager;
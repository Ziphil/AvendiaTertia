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
  let path = transformer.variables.path;
  let language = transformer.variables.language;
  let depth = path.split("/").length;
  let title = "no title";
  let articleType = (depth >= 1 && depth <= 2 && path.match(/index\.zml$/)) ? "content-table" : "main";
  let navigationNode = document.createDocumentFragment();
  let headerNode = document.createDocumentFragment();
  let mainNode = document.createDocumentFragment();
  mainNode.appendChild(transformer.apply(element, "page"));
  transformer.variables.foreignLanguage = (language === "ja") ? "en" : "ja";
  transformer.variables.title = title;
  transformer.variables.pageTitle = title + " — " + TRANSLATIONS.title[language];
  transformer.variables.articleType = articleType;
  transformer.variables.navigationNode = navigationNode;
  transformer.variables.headerNode = headerNode;
  return mainNode;
});

export default manager;
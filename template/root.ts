//

import {
  TemplateManager
} from "@zenml/zenml";
import {
  AVENDIA_CONFIGS
} from "../generator/configs";
import type {
  AvendiaDocument
} from "../generator/dom";
import type {
  AvendiaTransformerEnvironments,
  AvendiaTransformerVariables
} from "../generator/transformer";


let manager = new TemplateManager<AvendiaDocument, AvendiaTransformerEnvironments, AvendiaTransformerVariables>();

manager.registerElementRule("page", "", (transformer, document, element) => {
  let path = transformer.variables.path;
  let language = transformer.variables.language;
  let splitRelativePath = AVENDIA_CONFIGS.getSplitRelativeDocumentPath(path, language);
  let depth = splitRelativePath.length - 1;
  let articleType = (depth >= 1 && depth <= 2 && path.match(/index\.zml$/)) ? "content-table" : "main";
  let navigationNode = document.createDocumentFragment();
  let headerNode = document.createDocumentFragment();
  let mainNode = document.createDocumentFragment();
  transformer.variables.foreignLanguage = (language === "ja") ? "en" : "ja";
  navigationNode.appendChild(transformer.call("navigation", element));
  navigationNode.appendChild(transformer.apply(element, "navigation"));
  headerNode.appendChild(transformer.apply(element, "header"));
  mainNode.appendChild(transformer.apply(element, "page"));
  transformer.variables.articleType = articleType;
  transformer.variables.navigationNode = navigationNode;
  transformer.variables.headerNode = headerNode;
  return mainNode;
});

export default manager;
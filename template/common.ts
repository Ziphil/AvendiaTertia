//

import {
  DocumentTemplateManager
} from "@zenml/zenml";
import type {
  AvendiaDocument
} from "../converter/dom";


let manager = new DocumentTemplateManager<AvendiaDocument>();

manager.registerElementRule("page", true, (transformer, document, element) => {
  console.log(transformer.variables.path, transformer.variables.language);
  return transformer.apply(element, "page");
});

export default manager;
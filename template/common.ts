//

import {
  DocumentTemplateManager
} from "@zenml/zenml";
import type {
  AvendiaDocument
} from "../converter/dom";


let manager = new DocumentTemplateManager<AvendiaDocument>();

manager.registerElementRule("page", true, (transformer, document, element) => {
  return transformer.apply(element, "page");
});

export default manager;
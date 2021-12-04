//

import {
  DocumentTemplateManager,
  SimpleDocument
} from "@zenml/zenml";


let manager = new DocumentTemplateManager<SimpleDocument>();

manager.registerElementRule("page", true, (transformer, document, element) => {
  return transformer.apply(element, "page");
});

export default manager;
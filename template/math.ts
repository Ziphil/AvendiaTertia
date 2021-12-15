//

import {
  TemplateManager
} from "@zenml/zenml";
import type {
  AvendiaDocument
} from "../generator/dom";
import type {
  AvendiaTransformerEnvironments,
  AvendiaTransformerVariables
} from "../generator/transformer";


let manager = new TemplateManager<AvendiaDocument, AvendiaTransformerEnvironments, AvendiaTransformerVariables>();

manager.registerElementRule("use-math", "header", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  let mathStyleString = transformer.environments.mathStyleString;
  let mathScriptString = transformer.environments.mathScriptString;
  self.appendElement("style", (self) => {
    self.appendChild(document.createTextNode(mathStyleString, {raw: true}));
  });
  self.appendElement("script", (self) => {
    self.appendChild(document.createTextNode(mathScriptString, {raw: true}));
  });
  return self;
});

export default manager;
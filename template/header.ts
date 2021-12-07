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


let manager = new TemplateManager<AvendiaDocument, {}, AvendiaTransformerVariables>();

manager.registerElementRule("import-script", "header", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("script", (self) => {
    let content = element.textContent;
    if (content === null || content === "") {
      self.setAttribute("src", "/program/script/" + element.getAttribute("src"));
    } else {
      self.appendTextNode(content);
    }
  });
  self.appendTextNode("\n");
  return self;
});

manager.registerElementRule("base", "header", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("base", (self) => {
    self.setAttribute("href", element.getAttribute("href"));
  });
  self.appendTextNode("\n");
  return self;
});

manager.registerElementRule(true, "header", () => {
  return "";
});

manager.registerTextRule("header", () => {
  return "";
});

export default manager;
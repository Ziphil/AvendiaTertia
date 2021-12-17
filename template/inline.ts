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

manager.registerElementRule("x", ["page", "page.section-table"], (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("sans");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("xn", ["page", "page.section-table"], (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("sans");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("i", ["page", "page.section-table"], (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("var", (self) => {
    self.addClassName("italic");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("k", ["page", "page.section-table"], (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("japanese");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("h", ["page", "page.section-table"], (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("hairia");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule(["sup", "sub"], ["page", "page.section-table"], (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName(element.tagName);
    self.appendChild(transformer.apply());
  });
  return self;
});

export default manager;
//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("box", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("box");
    if (element.hasAttribute("num")) {
      self.appendTextNode(element.getAttribute("num"));
    }
    if (element.hasAttribute("tag")) {
      self.appendTextNode(element.getAttribute("tag").toUpperCase());
    }
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("label", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("label");
    self.appendChild(transformer.apply());
  });
  return self;
});

export default manager;
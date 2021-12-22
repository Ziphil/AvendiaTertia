//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";


let manager = new AvendiaTemplateManager();

manager.registerElementRule("el", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("dl", (self) => {
    self.addClassName("description-list");
    self.setBlockType("text", "text");
    self.appendChild(transformer.apply(element, "page.el"));
  });
  return self;
});

manager.registerElementRule("li", "page.el", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendChild(transformer.apply(element, "page.el.li"));
  return self;
});

manager.registerElementRule("et", "page.el.li", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("dt", (self) => {
    self.addClassName("description-left");
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

manager.registerElementRule("ed", "page.el.li", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("dd", (self) => {
    self.addClassName("description-right");
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

export default manager;
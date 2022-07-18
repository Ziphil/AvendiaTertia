//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("trans", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("dl", (self) => {
    self.addClassName("translation-list");
    self.setBlockType("text", "text");
    self.appendChild(transformer.apply(element, "page.trans"));
  });
  return self;
});

manager.registerElementRule("li", "page.trans", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendChild(transformer.apply(element, "page.trans.li"));
  return self;
});

manager.registerElementRule("ja", "page.trans.li", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("dt", (self) => {
    self.addClassName("translation-left");
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

manager.registerElementRule("sh", "page.trans.li", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("dd", (self) => {
    self.addClassName("translation-right");
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

export default manager;
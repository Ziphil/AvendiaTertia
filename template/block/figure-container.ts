//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("side", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("figure", (self) => {
    self.addClassName("figure-container");
    self.setBlockType("bordered", "bordered");
    self.appendChild(transformer.apply(element, "page", {contained: true}));
  });
  return self;
});

export default manager;
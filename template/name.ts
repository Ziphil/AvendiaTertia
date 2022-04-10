//

import {
  AvendiaTemplateManager
} from "../generator/transformer";


let manager = new AvendiaTemplateManager();

manager.registerElementRule("page", "name", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  let nameElement = element.searchXpath("/page/name")[0] as Element;
  self.appendChild(transformer.apply(nameElement, "page"));
  return self;
});

manager.registerElementRule(true, "name", (transformer, document) => {
  return document.createDocumentFragment();
});

manager.registerTextRule("name", (transformer, document) => {
  return document.createDocumentFragment();
});

export default manager;
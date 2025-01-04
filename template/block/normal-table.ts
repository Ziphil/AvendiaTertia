//

import {AvendiaTemplateManager} from "../../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("table", "page", (transformer, document, element, scope, args) => {
  const self = document.createDocumentFragment();
  self.appendElement("table", (self) => {
    self.addClassName("normal-table");
    self.appendChild(transformer.apply(element, "page.table"));
  });
  if (!args?.contained) {
    const innerSelf = self;
    const containerSelf = document.createDocumentFragment();
    containerSelf.appendElement("figure", (self) => {
      self.addClassName("figure-container");
      self.setBlockType("bordered", "bordered");
      self.appendChild(innerSelf);
    });
    return containerSelf;
  } else {
    return self;
  }
});

manager.registerElementRule("caption", "page.table", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("caption", (self) => {
    self.addClassName("normal-table-caption");
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

manager.registerElementRule("tr", "page.table", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("tr", (self) => {
    self.appendChild(transformer.apply(element, "page.table.tr"));
  });
  return self;
});

manager.registerElementRule(["th", "td"], "page.table.tr", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement(element.tagName, (self) => {
    if (element.hasAttribute("row")) {
      self.setAttribute("rowspan", element.getAttribute("row"));
    }
    if (element.hasAttribute("col")) {
      self.setAttribute("colspan", element.getAttribute("col"));
    }
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

export default manager;
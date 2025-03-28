//

import {AvendiaTemplateManager} from "../../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("el", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const type = element.getAttribute("type") || "desc";
  self.appendElement("dl", (self) => {
    self.addClassName("description-list");
    self.setAttribute("data-type", type);
    self.setBlockType("text", "text");
    self.appendChild(transformer.apply(element, "page.el"));
  });
  return self;
});

manager.registerElementRule("li", "page.el", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendChild(transformer.apply(element, "page.el.li"));
  return self;
});

manager.registerElementRule("et", "page.el.li", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("dt", (self) => {
    self.addClassName("description-left");
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

manager.registerElementRule("ed", "page.el.li", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("dd", (self) => {
    self.addClassName("description-right");
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

export default manager;
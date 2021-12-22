//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";


let manager = new AvendiaTemplateManager();

manager.registerElementRule(["ul", "ol"], "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement(element.tagName, (self) => {
    self.addClassName("normal-list");
    self.setBlockType("text", "text");
    self.setAttribute("data-type", (element.tagName === "ul") ? "unordered" : "ordered");
    if (element.getAttribute("col") === "2") {
      self.setAttribute("data-column", "2");
    } else if (element.getAttribute("col") === "3") {
      self.setAttribute("data-column", "3");
    }
    self.appendChild(transformer.apply(element, "page.ul"));
  });
  return self;
});

manager.registerElementRule("li", "page.ul", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement(element.tagName, (self) => {
    self.addClassName("normal-item");
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

export default manager;
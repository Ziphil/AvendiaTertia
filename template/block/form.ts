//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";


let manager = new AvendiaTemplateManager();

manager.registerElementRule("form", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("div", (self) => {
    self.addClassName("form");
    self.setBlockType("bordered", "bordered");
    self.appendChild(transformer.apply(element, "page.form"));
  });
  return self;
});

manager.registerElementRule(["a", "ae"], "page.form", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("a", (self) => {
    self.addClassName("form-button");
    if (element.hasAttribute("href")) {
      self.setAttribute("href", element.getAttribute("href"));
    }
    if (element.tagName === "ae") {
      self.setAttribute("target", "_blank");
      self.setAttribute("rel", "noopener noreferrer");
    }
    self.appendChild(transformer.apply());
  });
  return self;
});

export default manager;
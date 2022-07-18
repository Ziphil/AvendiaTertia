//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule(["a", "ae", "an"], "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const className = (element.tagName === "an") ? "hidden-link" : "link";
  self.appendElement("a", (self) => {
    self.addClassName(className);
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
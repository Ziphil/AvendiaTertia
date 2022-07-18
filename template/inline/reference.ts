//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";
import {
  getReferenceIndex
} from "../util";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("rref", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const referenceHrefs = getReferenceIndex(transformer).hrefs;
  const refTag = element.getAttribute("ref");
  const refHref = referenceHrefs[refTag] ?? "";
  self.appendElement("a", (self) => {
    self.addClassName("ref");
    self.addClassName("link");
    self.setAttribute("href", refHref);
    self.appendTextNode("@" + refTag.toUpperCase());
  });
  return self;
});

manager.registerElementRule("rterm", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const id = element.getAttribute("id");
  self.appendElement("span", (self) => {
    self.setAttribute("id", id);
    self.appendChild(transformer.apply());
  });
  return self;
});

export default manager;
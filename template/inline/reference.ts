//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";
import {
  getReferenceIndex
} from "../util";


let manager = new AvendiaTemplateManager();

manager.registerElementRule("rref", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  let referenceHrefs = getReferenceIndex(transformer).hrefs;
  let refTag = element.getAttribute("ref");
  let refHref = referenceHrefs[refTag] ?? "";
  self.appendElement("a", (self) => {
    self.addClassName("ref");
    self.addClassName("link");
    self.setAttribute("href", refHref);
    self.appendTextNode("@" + refTag.toUpperCase());
  });
  return self;
});

manager.registerElementRule("rterm", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  let id = element.getAttribute("id");
  self.appendElement("span", (self) => {
    self.setAttribute("id", id);
    self.appendChild(transformer.apply());
  });
  return self;
});

export default manager;
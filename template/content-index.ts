//

import {
  DocumentTemplateManager
} from "@zenml/zenml";
import type {
  AvendiaDocument
} from "../converter/dom";


let manager = new DocumentTemplateManager<AvendiaDocument>();

manager.registerElementRule("pb", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("div", (self) => {
    self.setAttribute("class", "index-container");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("hb", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("h1", (self) => {
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule(["ab", "abo", "aba", "abd"], "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("a", (self) => {
    let annotation = null as string | null;
    if (element.tagName === "ab") {
      self.tagName = "a";
      self.setAttribute("class", "index");
    } else if (element.tagName === "abo") {
      self.tagName = "a";
      self.setAttribute("class", "index old");
      annotation = "old";
    } else if (element.tagName === "aba") {
      self.tagName = "a";
      self.setAttribute("class", "index ancient");
      annotation = "ancient";
    } else if (element.tagName === "abd") {
      self.tagName = "div";
      self.setAttribute("class", "index");
    }
    for (let i = 0 ; i < element.attributes.length ; i ++) {
      let attribute = element.attributes.item(i)!;
      if (attribute.name === "date") {
        self.appendElement("span", (self) => {
          self.setAttribute("class", "date");
          if (attribute.value.match(/^\d+$/)) {
            self.appendElement("span", (self) => {
              self.setAttribute("class", "hairia");
              self.appendTextNode(attribute.value);
            });
          } else {
            self.appendTextNode(attribute.value);
          }
        });
      } else {
        self.setAttribute(attribute.name, attribute.value);
      }
    }
    self.appendElement("span", (self) => {
      self.setAttribute("class", "content");
      self.appendChild(transformer.apply());
    });
    if (annotation !== null) {
      self.appendElement("span", (self) => {
        self.setAttribute("class", "annotation");
        self.appendTextNode(annotation!);
      });
    }
  });
  return self;
});

export default manager;
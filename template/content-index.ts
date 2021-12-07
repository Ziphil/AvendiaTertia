//

import {
  TemplateManager
} from "@zenml/zenml";
import type {
  AvendiaDocument
} from "../converter/dom";
import type {
  AvendiaTransformerVariables
} from "../converter/transformer";


let manager = new TemplateManager<AvendiaDocument, {}, AvendiaTransformerVariables>();

manager.registerElementRule("pb", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("div", (self) => {
    self.addClassName("index-container");
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
      self.addClassName("index");
    } else if (element.tagName === "abo") {
      self.tagName = "a";
      self.addClassName("index old");
      annotation = "old";
    } else if (element.tagName === "aba") {
      self.tagName = "a";
      self.addClassName("index ancient");
      annotation = "ancient";
    } else if (element.tagName === "abd") {
      self.tagName = "div";
      self.addClassName("index");
    }
    if (element.hasAttribute("date")) {
      let date = element.getAttribute("date");
      self.appendElement("span", (self) => {
        self.addClassName("date");
        if (date.match(/^\d+$/)) {
          self.appendElement("span", (self) => {
            self.addClassName("hairia");
            self.appendTextNode(date);
          });
        } else {
          self.appendTextNode(date);
        }
      });
    }
    if (element.hasAttribute("href")) {
      self.setAttribute("href", element.getAttribute("href"));
    }
    self.appendElement("span", (self) => {
      self.addClassName("content");
      self.appendChild(transformer.apply());
    });
    if (annotation !== null) {
      self.appendElement("span", (self) => {
        self.addClassName("annotation");
        self.appendTextNode(annotation!);
      });
    }
  });
  return self;
});

export default manager;
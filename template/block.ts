//

import {
  TemplateManager
} from "@zenml/zenml";
import type {
  AvendiaDocument,
  AvendiaElement
} from "../generator/dom";
import type {
  AvendiaTransformerEnvironments,
  AvendiaTransformerVariables
} from "../generator/transformer";


let manager = new TemplateManager<AvendiaDocument, AvendiaTransformerEnvironments, AvendiaTransformerVariables>();

manager.registerElementRule(["h1", "h2"], "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  let className = (element.tagName === "h1") ? "section" : "subsection";
  self.appendElement(element.tagName, (self) => {
    let innerSelf = null as any as AvendiaElement;
    self.addClassName(className);
    if (element.hasAttribute("id")) {
      self.setAttribute("id", element.getAttribute("id"));
    }
    self.appendElement("div", (self) => {
      innerSelf = self;
      self.addClassName(`${className}-inner`);
      self.appendChild(transformer.apply());
    });
    if (element.hasAttribute("num")) {
      self.setAttribute("id", element.getAttribute("num"));
      innerSelf.insertElementHead("span", (self) => {
        self.addClassName(`${className}-number`);
        self.setAttribute("data-number", element.getAttribute("num"));
      });
    }
  });
  return self;
});

manager.registerElementRule("p", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("p", (self) => {
    self.addClassName("paragraph");
    self.appendChild(transformer.apply());
    if (element.hasAttribute("num")) {
      self.insertElementHead("span", (self) => {
        self.addClassName("paragraph-number");
        self.setAttribute("data-number", element.getAttribute("num"));
      });
    }
  });
  return self;
});

manager.registerElementRule(["ul", "ol"], "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement(element.tagName, (self) => {
    self.addClassName("normal-list");
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
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule(["name", "ver", "use-script", "use-math"], "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  return self;
});

export default manager;
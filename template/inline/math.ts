//

import {AvendiaTemplateManager} from "../../generator/transformer";
import {NumberRefType, getNumber, setNumber} from "../util";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("math-inline", "page", (transformer, document, element, scope, args) => {
  const self = document.createDocumentFragment();
  self.appendChild(transformer.apply(element, "math-html"));
  return self;
});

manager.registerElementRule("math-block", "page", (transformer, document, element, scope, args) => {
  const self = document.createDocumentFragment();
  const markElement = element.searchXpath("math-root/math-mark")[0];
  const id = element.getAttribute("id");
  if (element.hasAttribute("id")) {
    setNumber(transformer, element, "equation", id);
  }
  self.appendElement("span", (self) => {
    self.addClassName("math-container");
    self.appendElement("span", (self) => {
      self.addClassName("math-inner-container");
      self.appendElement("span", (self) => {
        self.addClassName("math");
        self.appendChild(transformer.apply(element, "math-html"));
      });
    });
    if (element.hasAttribute("id")) {
      self.setAttribute("id", id);
      self.appendElement("span", (self) => {
        self.addClassName("math-mark");
        self.appendTextNode(getNumber(transformer, element, "equation", false, id));
      });
    } else if (typeof markElement === "object" && markElement.isElement()) {
      const castMarkElement = markElement;
      self.appendElement("span", (self) => {
        self.addClassName("math-mark");
        self.appendChild(transformer.apply(castMarkElement, "math-html"));
      });
    }
  });
  return self;
});

manager.registerElementRule("def", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendTextNode("「");
  self.appendElement("em", (self) => {
    self.appendChild(transformer.apply());
  });
  self.appendTextNode("」");
  return self;
});

manager.registerElementRule("mref", "page", (transformer, document, element, scope, args) => {
  const self = document.createDocumentFragment();
  const refId = element.getAttribute("ref");
  const rawType = element.getAttribute("type");
  const type = (rawType === "thm") ? "theorem" : (rawType === "eq") ? "equation" : "bibliography" as NumberRefType;
  const noLink = element.hasAttribute("nolink") || rawType !== "thm";
  const tagName = (noLink) ? "span" : "a";
  self.appendElement(tagName, (self) => {
    self.addClassName("ref");
    if (!noLink) {
      self.addClassName("link");
      self.setAttribute("href", `#${refId}`);
    }
    self.setAttribute("data-type", type);
    if (type === "bibliography") {
      self.appendTextNode("†");
    }
    self.appendTextNode(getNumber(transformer, element, type, true, refId));
  });
  return self;
});

manager.registerElementRule(true, "math-html", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  if (element.tagName !== "math-mark") {
    self.appendElement(element.tagName, (self) => {
      for (let i = 0 ; i < element.attributes.length ; i ++) {
        const {name, value} = element.attributes.item(i)!;
        self.setAttribute(name, value);
      }
      self.appendChild(transformer.apply());
    });
  }
  return self;
});

export default manager;
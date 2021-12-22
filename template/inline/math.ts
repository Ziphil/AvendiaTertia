//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";
import {
  ReferenceType,
  getNumber,
  setNumber
} from "../util";


let manager = new AvendiaTemplateManager();

manager.registerElementRule("math-inline", "page", (transformer, document, element, scope, args) => {
  let self = document.createDocumentFragment();
  self.appendChild(transformer.apply(element, "math-html"));
  return self;
});

manager.registerElementRule("math-block", "page", (transformer, document, element, scope, args) => {
  let self = document.createDocumentFragment();
  let markElement = element.searchXpath("math-root/math-mark")[0];
  let id = element.getAttribute("id");
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
      let castMarkElement = markElement;
      self.appendElement("span", (self) => {
        self.addClassName("math-mark");
        self.appendChild(transformer.apply(castMarkElement, "math-html"));
      });
    }
  });
  return self;
});

manager.registerElementRule("ref", "page", (transformer, document, element, scope, args) => {
  let self = document.createDocumentFragment();
  let referenceId = element.getAttribute("ref");
  let rawType = element.getAttribute("type");
  let type = (rawType === "thm") ? "theorem" : (rawType === "eq") ? "equation" : "bibliography" as ReferenceType;
  let noLink = element.hasAttribute("nolink") || rawType !== "thm";
  let tagName = (noLink) ? "span" : "a";
  self.appendElement(tagName, (self) => {
    self.addClassName("reference");
    if (!noLink) {
      self.addClassName("link");
      self.setAttribute("href", `#${referenceId}`);
    }
    self.setAttribute("data-type", type);
    self.appendTextNode(getNumber(transformer, element, type, true, referenceId));
  });
  return self;
});

manager.registerElementRule(true, "math-html", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  if (element.tagName !== "math-mark") {
    self.appendElement(element.tagName, (self) => {
      for (let i = 0 ; i < element.attributes.length ; i ++) {
        let {name, value} = element.attributes.item(i)!;
        self.setAttribute(name, value);
      }
      self.appendChild(transformer.apply());
    });
  }
  return self;
});

export default manager;
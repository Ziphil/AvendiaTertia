//

import {
  TemplateManager
} from "@zenml/zenml";
import type {
  AvendiaDocument
} from "../generator/dom";
import type {
  AvendiaTransformerEnvironments,
  AvendiaTransformerVariables
} from "../generator/transformer";
import {
  ReferenceType,
  getNumber,
  setNumber
} from "./util";


let manager = new TemplateManager<AvendiaDocument, AvendiaTransformerEnvironments, AvendiaTransformerVariables>();

manager.registerElementRule("x", ["page", "page.section-table"], (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("sans");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("xn", ["page", "page.section-table"], (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("sans");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("i", ["page", "page.section-table"], (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("var", (self) => {
    self.addClassName("italic");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("k", ["page", "page.section-table"], (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("japanese");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule(["c", "m"], ["page", "page.section-table"], (transformer, document, element) => {
  let self = document.createDocumentFragment();
  let className = (element.tagName === "c") ? "code" : "monospace";
  self.appendElement("code", (self) => {
    self.addClassName(className);
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("h", ["page", "page.section-table"], (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("hairia");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule(["a", "ae", "an"], "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  let className = (element.tagName === "an") ? "hidden-link" : "link";
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

manager.registerElementRule("fl", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("foreign");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("em", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("em", (self) => {
    self.addClassName("emphasis");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("small", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("small");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("lys", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("lyrics-space");
  });
  return self;
});

manager.registerElementRule("red", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("redaction");
    if (element.hasAttribute("len")) {
      let length = parseInt(element.getAttribute("len"));
      self.appendTextNode(" ".repeat(length));
    }
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("label", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("label");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule(["sup", "sub"], ["page", "page.section-table"], (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName(element.tagName);
    self.appendChild(transformer.apply());
  });
  return self;
});

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
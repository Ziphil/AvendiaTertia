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


let manager = new TemplateManager<AvendiaDocument, AvendiaTransformerEnvironments, AvendiaTransformerVariables>();

manager.registerElementRule(["h1", "h2"], "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  let className = (element.tagName === "h1") ? "section" : "subsection";
  let topBlockType = (element.tagName === "h1") ? "bordered" : "text";
  self.appendElement(element.tagName, (self) => {
    let innerSelf = document.placeholder();
    self.addClassName(className);
    self.setBlockType(topBlockType, "bordered");
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
    self.setBlockType("text", "text");
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
    self.setBlockType("text", "text");
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

manager.registerElementRule("el", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("dl", (self) => {
    self.addClassName("description-list");
    self.setBlockType("text", "text");
    self.appendChild(transformer.apply(element, "page.el"));
  });
  return self;
});

manager.registerElementRule("li", "page.el", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendChild(transformer.apply(element, "page.el.li"));
  return self;
});

manager.registerElementRule("et", "page.el.li", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("dt", (self) => {
    self.addClassName("description-left");
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

manager.registerElementRule("ed", "page.el.li", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("dd", (self) => {
    self.addClassName("description-right");
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

manager.registerElementRule("trans", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("dl", (self) => {
    self.addClassName("translation-list");
    self.setBlockType("text", "text");
    self.appendChild(transformer.apply(element, "page.trans"));
  });
  return self;
});

manager.registerElementRule("li", "page.trans", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendChild(transformer.apply(element, "page.trans.li"));
  return self;
});

manager.registerElementRule("ja", "page.trans.li", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("dt", (self) => {
    self.addClassName("translation-left");
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

manager.registerElementRule("sh", "page.trans.li", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("dd", (self) => {
    self.addClassName("translation-right");
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

manager.registerElementRule("xl", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("dl", (self) => {
    self.addClassName("sentence-list");
    self.setBlockType("bordered", "bordered");
    self.appendChild(transformer.apply(element, "page.xl"));
  });
  return self;
});

manager.registerElementRule("li", "page.xl", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendChild(transformer.apply(element, "page.xl.li"));
  return self;
});

manager.registerElementRule("sh", "page.xl.li", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("dt", (self) => {
    self.addClassName("sentence-item");
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

manager.registerElementRule("ja", "page.xl.li", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("dd", (self) => {
    self.addClassName("sentence-nested-item");
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

manager.registerElementRule("side", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("figure", (self) => {
    self.addClassName("figure-container");
    self.setBlockType("bordered", "bordered");
    self.appendChild(transformer.apply(element, "page", {contained: true}));
  });
  return self;
});

manager.registerElementRule("img", "page", (transformer, document, element, scope, args) => {
  let self = document.createDocumentFragment();
  self.appendElement("img", (self) => {
    self.addClassName("image");
    if (element.hasAttribute("src")) {
      self.setAttribute("src", element.getAttribute("src"));
    }
    if (element.hasAttribute("alt")) {
      self.setAttribute("alt", element.getAttribute("alt"));
    } else {
      self.setAttribute("alt", "");
    }
  });
  if (!args?.contained) {
    let innerSelf = self;
    let containerSelf = document.createDocumentFragment();
    containerSelf.appendElement("figure", (self) => {
      self.addClassName("figure-container");
      self.setBlockType("bordered", "bordered");
      self.appendChild(innerSelf);
    });
    return containerSelf;
  } else {
    return self;
  }
});

manager.registerElementRule("table", "page", (transformer, document, element, scope, args) => {
  let self = document.createDocumentFragment();
  self.appendElement("table", (self) => {
    self.addClassName("table");
    self.appendChild(transformer.apply(element, "page.table"));
  });
  if (!args?.contained) {
    let innerSelf = self;
    let containerSelf = document.createDocumentFragment();
    containerSelf.appendElement("figure", (self) => {
      self.addClassName("figure-container");
      self.setBlockType("bordered", "bordered");
      self.appendChild(innerSelf);
    });
    return containerSelf;
  } else {
    return self;
  }
});

manager.registerElementRule("caption", "page.table", (transformer, document, element, scope, args) => {
  let self = document.createDocumentFragment();
  self.appendElement("caption", (self) => {
    self.addClassName("table-caption");
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

manager.registerElementRule("tr", "page.table", (transformer, document, element, scope, args) => {
  let self = document.createDocumentFragment();
  self.appendElement("tr", (self) => {
    self.appendChild(transformer.apply(element, "page.table.tr"));
  });
  return self;
});

manager.registerElementRule(["th", "td"], "page.table.tr", (transformer, document, element, scope, args) => {
  let self = document.createDocumentFragment();
  self.appendElement(element.tagName, (self) => {
    if (element.hasAttribute("row")) {
      self.setAttribute("rowspan", element.getAttribute("row"));
    }
    if (element.hasAttribute("col")) {
      self.setAttribute("colspan", element.getAttribute("col"));
    }
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

manager.registerElementRule(["name", "ver", "use-script", "use-math"], "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  return self;
});

export default manager;
//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";


let manager = new AvendiaTemplateManager();

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

export default manager;
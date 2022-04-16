//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";


let manager = new AvendiaTemplateManager();

manager.registerElementRule("form", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("div", (self) => {
    self.addClassName("form");
    self.setBlockType("bordered", "bordered");
    self.appendChild(transformer.apply(element, "page.form"));
  });
  return self;
});

manager.registerElementRule("form-table", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("table", (self) => {
    self.addClassName("form-table");
    self.setBlockType("bordered", "bordered");
    self.appendChild(transformer.apply(element, "page.form-table"));
  });
  return self;
});

manager.registerElementRule("tr", "page.form-table", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("tr", (self) => {
    self.appendChild(transformer.apply(element, "page.form-table.tr"));
  });
  return self;
});

manager.registerElementRule("td", "page.form-table.tr", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("td", (self) => {
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

manager.registerElementRule("input", ["page", "page.form"], (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("input", (self) => {
    self.addClassName("form-input");
    self.setAttribute("type", "text");
    if (element.hasAttribute("id")) {
      self.setAttribute("id", element.getAttribute("id"));
    }
    if (element.hasAttribute("size")) {
      self.setAttribute("size", element.getAttribute("size"));
    }
    if (element.hasAttribute("width")) {
      self.setAttribute("style", `width: ${element.getAttribute("width")}em;`);
    }
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

manager.registerElementRule("button", ["page", "page.form"], (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("button", (self) => {
    if (element.hasAttribute("id")) {
      self.setAttribute("id", element.getAttribute("id"));
    }
    self.addClassName("form-button");
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

manager.registerElementRule(["a", "ae"], "page.form", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("a", (self) => {
    self.addClassName("form-button");
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

export default manager;
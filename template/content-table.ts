//

import {
  AvendiaTemplateManager
} from "../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("pb", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("div", (self) => {
    self.addClassName("content-table");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("hb", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("h1", (self) => {
    self.addClassName("content-head");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule(["ab", "abo", "aba", "abd"], "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("a", (self) => {
    self.addClassName("content-item");
    if (element.tagName === "ab") {
      self.tagName = "a";
    } else if (element.tagName === "abo") {
      self.tagName = "a";
      self.setAttribute("data-era", "old");
    } else if (element.tagName === "aba") {
      self.tagName = "a";
      self.setAttribute("data-era", "ancient");
    } else if (element.tagName === "abd") {
      self.tagName = "div";
      self.setAttribute("data-disabled", "");
    }
    if (element.hasAttribute("date")) {
      const date = element.getAttribute("date");
      self.appendElement("div", (self) => {
        self.addClassName("content-date");
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
    self.appendElement("div", (self) => {
      self.addClassName("content-title");
      self.appendChild(transformer.apply());
    });
    if (self.getAttribute("data-era") !== null) {
      self.appendElement("div", (self) => {
        self.addClassName("content-era");
        self.setAttribute("data-era", self.getAttribute("data-era")!);
      });
    }
  });
  return self;
});

export default manager;
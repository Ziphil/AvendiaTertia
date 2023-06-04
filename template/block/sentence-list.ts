//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule(["xl", "xol"], "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("dl", (self) => {
    self.addClassName("sentence-list");
    self.setBlockType("bordered", "bordered");
    self.setAttribute("data-type", (element.tagName === "xl") ? "unordered" : "ordered");
    self.appendChild(transformer.apply(element, "page.xl"));
  });
  return self;
});

manager.registerElementRule("li", "page.xl", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendChild(transformer.apply(element, "page.xl.li"));
  return self;
});

manager.registerElementRule("sh", "page.xl.li", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const parentElement = element.parentNode as Element;
  self.appendElement("dt", (self) => {
    self.addClassName("sentence-item");
    self.appendChild(transformer.apply(element, "page"));
    if (parentElement.hasAttribute("tag")) {
      self.setAttribute("data-tag", parentElement.getAttribute("tag")!.toUpperCase());
    }
    if (element.hasAttribute("mark")) {
      const rawMark = element.getAttribute("mark");
      const mark = (rawMark === "u") ? "ungrammatical" : "question";
      self.insertHead(document.createElement("span", (self) => {
        self.addClassName("sentence-mark");
        self.setAttribute("data-mark", mark);
      }));
    }
  });
  return self;
});

manager.registerElementRule("ja", "page.xl.li", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("dd", (self) => {
    self.addClassName("sentence-nested-item");
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

export default manager;
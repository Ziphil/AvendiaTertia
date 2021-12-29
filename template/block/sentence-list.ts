//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";


let manager = new AvendiaTemplateManager();

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
    if (element.hasAttribute("mark")) {
      let rawMark = element.getAttribute("mark");
      let mark = (rawMark === "u") ? "ungrammatical" : "question";
      self.insertHead(document.createElement("span", (self) => {
        self.addClassName("sentence-mark");
        self.setAttribute("data-mark", mark);
      }));
    }
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

export default manager;
//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";


let manager = new AvendiaTemplateManager();

manager.registerElementRule(["h1", "h2"], "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  let className = (element.tagName === "h1") ? "section" : "subsection";
  self.appendElement(element.tagName, (self) => {
    let innerSelf = document.placeholder();
    self.addClassName(className);
    self.setBlockType("bordered", "bordered");
    if (element.hasAttribute("id")) {
      self.setAttribute("id", element.getAttribute("id"));
    }
    self.appendElement("div", (self) => {
      innerSelf = self;
      self.addClassName(`${className}-inner`);
      self.appendChild(transformer.apply());
    });
    if (element.hasAttribute("tag")) {
      self.setAttribute("id", element.getAttribute("tag"));
      innerSelf.insertHead(document.createElement("span", (self) => {
        self.addClassName(`${className}-tag`);
        self.appendTextNode("@" + element.getAttribute("tag").toUpperCase() + ".");
      }));
    }
    if (element.hasAttribute("num")) {
      self.setAttribute("id", element.getAttribute("num"));
      innerSelf.insertHead(document.createElement("span", (self) => {
        self.addClassName(`${className}-number`);
        self.appendTextNode("§" + element.getAttribute("num") + ".");
      }));
    }
  });
  return self;
});

export default manager;
//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule(["h1", "h2", "h3"], "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const className = (element.tagName === "h1") ? "section" : (element.tagName === "h2") ? "subsection" : "subsubsection";
  const blockType = (element.tagName !== "h3") ? "bordered" : "text";
  self.appendElement(element.tagName, (self) => {
    let innerSelf = document.placeholder();
    self.addClassName(className);
    self.setAttribute("data-section", "");
    self.setBlockType(blockType, blockType);
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
        self.appendTextNode("#" + element.getAttribute("tag").toUpperCase() + ".");
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
//

import {AvendiaTemplateManager} from "../../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("p", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("p", (self) => {
    self.addClassName("paragraph");
    self.setBlockType("text", "text");
    self.appendChild(transformer.apply());
    if (element.hasAttribute("rtl")) {
      self.setAttribute("dir", "rtl");
      self.setAttribute("data-rtl", "");
    }
    if (element.hasAttribute("num")) {
      self.insertHead(document.createElement("span", (self) => {
        self.addClassName("paragraph-number");
        self.setAttribute("data-number", element.getAttribute("num"));
      }));
    }
  });
  return self;
});

export default manager;
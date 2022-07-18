//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("img", "page", (transformer, document, element, scope, args) => {
  const self = document.createDocumentFragment();
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
    const innerSelf = self;
    const containerSelf = document.createDocumentFragment();
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

export default manager;
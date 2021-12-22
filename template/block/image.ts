//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";


let manager = new AvendiaTemplateManager();

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

export default manager;
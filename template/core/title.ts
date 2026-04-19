//

import {AvendiaTemplateManager} from "../../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementFactory("core-title", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendChild(transformer.call("title", element));
  return self;
});

manager.registerElementFactory("title", (transformer, document, element) => {
  const scheme = transformer.variables.scheme;
  const self = document.createDocumentFragment();
  if (scheme === "shaleian") {
    self.appendElement("span", (self) => {
      self.addClassName("header-title-text");
      self.setAttribute("data-size", "single");
      self.appendTextNode("Avendia");
    });
  } else if (scheme === "fennese") {
    self.appendElement("span", (self) => {
      self.addClassName("header-title-text");
      self.setAttribute("data-size", "single");
      self.appendTextNode("Лофжучло");
    });
  } else {
    self.appendElement("span", (self) => {
      self.addClassName("header-title-text");
      self.setAttribute("data-size", "small");
      self.appendTextNode("ΤΑ ΖΙΦΙΛΟΥ");
    });
    self.appendElement("span", (self) => {
      self.addClassName("header-title-text");
      self.setAttribute("data-size", "large");
      self.appendTextNode("ΒΙΒΛΙΑ");
    });
  }
  return self;
});

export default manager;
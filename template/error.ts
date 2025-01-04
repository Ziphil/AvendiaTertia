//

import {AvendiaTemplateManager} from "../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("error", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("div", (self) => {
    self.addClassName("error");
    self.appendElement("div", (self) => {
      self.addClassName("error-code-container");
      self.appendElement("div", (self) => {
        self.addClassName("error-code");
        self.appendChild(transformer.apply(element.getChildElements("code")[0], "page.error"));
      });
      self.appendElement("div", (self) => {
        self.addClassName("error-message");
        self.appendChild(transformer.apply(element.getChildElements("message")[0], "page.error"));
      });
    });
    self.appendElement("div", (self) => {
      self.addClassName("error-description");
      self.appendChild(transformer.apply(element.getChildElements("desc")[0], "page.error"));
    });
  });
  return self;
});

manager.registerElementRule("br", "page.error", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("br");
  return self;
});

export default manager;
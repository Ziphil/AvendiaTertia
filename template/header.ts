//

import {
  AvendiaTemplateManager
} from "../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("use-script", "header", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("script", (self) => {
    const content = element.textContent;
    if (content === null || content === "") {
      self.setAttribute("src", "/program/script/" + element.getAttribute("src"));
    } else {
      self.appendTextNode(content);
    }
  });
  self.appendTextNode("\n");
  return self;
});

manager.registerElementRule("use-math", "header", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const mathStyleString = transformer.environments.mathStyleString;
  const mathScriptString = transformer.environments.mathScriptString;
  if (element.hasAttribute("prefix")) {
    transformer.variables.numberPrefix = element.getAttribute("prefix");
  }
  self.appendElement("style", (self) => {
    self.appendChild(document.createTextNode(mathStyleString, (self) => self.options.raw = true));
  });
  self.appendElement("script", (self) => {
    self.appendChild(document.createTextNode(mathScriptString, (self) => self.options.raw = true));
  });
  return self;
});

manager.registerElementRule("base", "header", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("base", (self) => {
    self.setAttribute("href", element.getAttribute("href"));
  });
  self.appendTextNode("\n");
  return self;
});

manager.registerElementRule(true, "header", (transformer, document) => {
  return document.createDocumentFragment();
});

manager.registerTextRule("header", (transformer, document) => {
  return document.createDocumentFragment();
});

export default manager;
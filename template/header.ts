//

import {
  AvendiaTemplateManager
} from "../generator/transformer";


let manager = new AvendiaTemplateManager();

manager.registerElementRule("use-script", "header", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("script", (self) => {
    let content = element.textContent;
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
  let self = document.createDocumentFragment();
  let mathStyleString = transformer.environments.mathStyleString;
  let mathScriptString = transformer.environments.mathScriptString;
  if (element.hasAttribute("prefix")) {
    transformer.variables.numberPrefix = element.getAttribute("prefix");
  }
  self.appendElement("style", (self) => {
    self.appendChild(document.createTextNode(mathStyleString, {raw: true}));
  });
  self.appendElement("script", (self) => {
    self.appendChild(document.createTextNode(mathScriptString, {raw: true}));
  });
  return self;
});

manager.registerElementRule("base", "header", (transformer, document, element) => {
  let self = document.createDocumentFragment();
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
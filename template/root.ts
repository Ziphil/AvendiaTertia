//

import type {AvendiaOutputLanguage} from "../generator/configs";
import {AvendiaLightTransformer, AvendiaTemplateManager} from "../generator/transformer";


const manager = new AvendiaTemplateManager();

function getMainClassName(path: string, language: AvendiaOutputLanguage, transformer: AvendiaLightTransformer): string {
  const splitRelativePath = transformer.environments.configs.getSplitRelativeDocumentPath(path, language);
  const depth = splitRelativePath.length - 1;
  if (depth >= 1 && depth <= 2 && path.match(/index\.zml$/)) {
    return "content-table-main";
  } else if (depth === 2 && path.match(/error/)) {
    return "error-main";
  } else {
    return "main";
  }
}

function getScheme(path: string, transformer: AvendiaLightTransformer): string {
  const splitRelativePath = transformer.environments.configs.getSplitRelativeDocumentPath(path, transformer.variables.language);
  if (splitRelativePath[0] === "shaleian") {
    return "shaleian";
  } else if (splitRelativePath[0] === "fennese") {
    return "fennese";
  } else {
    return "default";
  }
}

manager.registerElementRule("page", "", (transformer, document, element) => {
  const path = transformer.variables.path;
  const language = transformer.variables.language;
  const foreignLanguage = (language === "ja") ? "en" : "ja";
  const scheme = getScheme(path, transformer);
  const mainClassName = getMainClassName(path, language, transformer);
  transformer.variables.foreignLanguage = foreignLanguage;
  transformer.variables.mode = "page";
  transformer.variables.scheme = scheme;
  const headNode = document.createDocumentFragment();
  const navigationNode = document.createDocumentFragment();
  const titleNode = document.createDocumentFragment();
  const linkNode = document.createDocumentFragment();
  const mainNode = document.createDocumentFragment();
  headNode.appendChild(transformer.call("analytics", element));
  headNode.appendChild(transformer.apply(element, "head"));
  navigationNode.appendChild(transformer.call("navigation", element));
  navigationNode.appendChild(transformer.apply(element, "navigation"));
  titleNode.appendChild(transformer.call("title", element));
  mainNode.appendElement("article", (self) => {
    self.addClassName(mainClassName);
    self.appendChild(transformer.apply(element, "page"));
  });
  transformer.variables.headNode = headNode;
  transformer.variables.navigationNode = navigationNode;
  transformer.variables.titleNode = titleNode;
  transformer.variables.linkNode = linkNode;
  return mainNode;
});

manager.registerElementRule("html", "", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const language = transformer.variables.language;
  transformer.variables.mode = "html";
  self.appendElement("html", (self) => {
    self.setAttribute("lang", language);
    self.appendChild(transformer.apply(element, "html"));
  });
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
      self.appendTextNode("ЛОФЖОЧЛО");
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

manager.registerElementFactory("analytics", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("script", (self) => {
    self.setAttribute("async", "async");
    self.setAttribute("src", "https://www.googletagmanager.com/gtag/js?id=G-TGGC8V3L3P");
  });
  self.appendElement("script", (self) => {
    self.appendTextNode(`
      window.dataLayer = window.dataLayer || [];
      function gtag(){
        dataLayer.push(arguments);
      }
      gtag("js", new Date());
      gtag("config", "G-TGGC8V3L3P");
    `, (self) => self.options.raw = true);
  });
  return self;
});

export default manager;
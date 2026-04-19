//

import type {AvendiaOutputLanguage} from "../generator/configs";
import {AvendiaLightTransformer, AvendiaTemplateManager} from "../generator/transformer";


const manager = new AvendiaTemplateManager();

function getTransparent(path: string, language: AvendiaOutputLanguage, transformer: AvendiaLightTransformer): boolean {
  const splitRelativePath = transformer.environments.configs.getSplitRelativeDocumentPath(path, language);
  const depth = splitRelativePath.length - 1;
  if (depth >= 1 && depth <= 2 && path.match(/index\.zml$/)) {
    return true;
  } else if (depth === 2 && path.match(/error/)) {
    return true;
  } else {
    return false;
  }
}

function getScheme(path: string, transformer: AvendiaLightTransformer): string {
  const splitRelativePath = transformer.environments.configs.getSplitRelativeDocumentPath(path, transformer.variables.language);
  if (splitRelativePath[0] === "shaleian") {
    return "shaleian";
  } else if (splitRelativePath[0] === "fennese") {
    return "fennese";
  } else {
    return "other";
  }
}

manager.registerElementRule("page", "", (transformer, document, element) => {
  const path = transformer.variables.path;
  const language = transformer.variables.language;
  const scheme = getScheme(path, transformer);
  const transparent = getTransparent(path, language, transformer);
  transformer.variables.mode = "page";
  transformer.variables.scheme = scheme;
  const headNode = document.createDocumentFragment();
  const navigationNode = document.createDocumentFragment();
  const titleNode = document.createDocumentFragment();
  const linkNode = document.createDocumentFragment();
  const mainNode = document.createDocumentFragment();
  headNode.appendChild(transformer.call("core-head", element));
  navigationNode.appendChild(transformer.call("core-navigation", element));
  titleNode.appendChild(transformer.call("core-title", element));
  mainNode.appendChild(transformer.call("series", element));
  mainNode.appendElement("article", (self) => {
    self.addClassName("main");
    self.appendElement("div", (self) => {
      self.addClassName("main-inner");
      if (transparent) {
        self.setAttribute("data-transparent", "");
      }
      self.appendChild(transformer.apply(element, "page"));
    });
  });
  transformer.variables.headNode = headNode;
  transformer.variables.navigationNode = navigationNode;
  transformer.variables.titleNode = titleNode;
  transformer.variables.linkNode = linkNode;
  return mainNode;
});

manager.registerElementRule("html", "", (transformer, document, element) => {
  const path = transformer.variables.path;
  const language = transformer.variables.language;
  const scheme = getScheme(path, transformer);
  transformer.variables.mode = "html";
  transformer.variables.scheme = scheme;
  const mainNode = document.createDocumentFragment();
  mainNode.appendElement("html", (self) => {
    self.setAttribute("lang", language);
    self.appendChild(transformer.apply(element, "html"));
  });
  return mainNode;
});

export default manager;
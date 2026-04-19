//

import {AvendiaLightTransformer, AvendiaTemplateManager} from "../generator/transformer";


const manager = new AvendiaTemplateManager();

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
  const scheme = getScheme(path, transformer);
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
  mainNode.appendChild(transformer.call("core-main", element));
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
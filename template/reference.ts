//

import type {
  ReferenceSectionSpec
} from "../generator/service/reference";
import {
  AvendiaTemplateManager
} from "../generator/transformer";


let manager = new AvendiaTemplateManager();

manager.registerElementRule("page", "reference", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  let path = transformer.variables.path;
  let language = transformer.variables.language;
  let splitRelativePath = transformer.environments.configs.getSplitRelativeDocumentPath(path, language);
  let baseHref = splitRelativePath[splitRelativePath.length - 1].replace(/\.zml/, ".html");
  let sectionElements = element.searchXpath("/page/*[name() = 'h1' or name() = 'h2']") as Array<Element>;
  let sectionSpecs = [] as Array<ReferenceSectionSpec>;
  let currentSectionSpec = null as ReferenceSectionSpec | null;
  for (let sectionElement of sectionElements) {
    let tag = sectionElement.getAttribute("tag");
    let href = baseHref + "#" + tag;
    let content = transformer.apply(sectionElement, "page").toString();
    if (sectionElement.tagName === "h1") {
      if (currentSectionSpec !== null) {
        sectionSpecs.push(currentSectionSpec);
      }
      currentSectionSpec = {href, tag, content, childSpecs: []};
    } else if (sectionElement.tagName === "h2") {
      let subsectionSpec = {href, tag, content, childSpecs: []};
      currentSectionSpec?.childSpecs.push(subsectionSpec);
    }
  }
  if (currentSectionSpec !== null) {
    sectionSpecs.push(currentSectionSpec);
  }
  self.appendTextNode(JSON.stringify(sectionSpecs), (self) => self.options.raw = true);
  return self;
});

manager.registerElementRule(true, "reference", (transformer, document) => {
  return document.createDocumentFragment();
});

manager.registerTextRule("reference", (transformer, document) => {
  return document.createDocumentFragment();
});

export default manager;
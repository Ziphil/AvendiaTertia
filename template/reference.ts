//

import type {
  ReferenceSectionSpec
} from "../generator/service/reference";
import {
  AvendiaTemplateManager
} from "../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("page", "reference", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const path = transformer.variables.path;
  const language = transformer.variables.language;
  const splitRelativePath = transformer.environments.configs.getSplitRelativeDocumentPath(path, language);
  const baseHref = splitRelativePath[splitRelativePath.length - 1].replace(/\.zml/, ".html");
  const sectionElements = element.searchXpath("/page/*[name() = 'h1' or name() = 'h2' or name() = 'h3']") as Array<Element>;
  const sectionSpecs = [] as Array<ReferenceSectionSpec>;
  let currentSectionSpec = null as ReferenceSectionSpec | null;
  let currentSubsectionSpec = null as ReferenceSectionSpec | null;
  for (const sectionElement of sectionElements) {
    const tag = sectionElement.getAttribute("tag");
    const href = baseHref + "#" + tag;
    const content = transformer.apply(sectionElement, "page").toString();
    if (sectionElement.tagName === "h1") {
      const sectionSpec = {href, tag, content, childSpecs: []};
      currentSectionSpec = sectionSpec;
      currentSubsectionSpec = null;
      sectionSpecs.push(sectionSpec);
    } else if (sectionElement.tagName === "h2") {
      const subsectionSpec = {href, tag, content, childSpecs: []};
      currentSubsectionSpec = subsectionSpec;
      currentSectionSpec?.childSpecs.push(subsectionSpec);
    } else if (sectionElement.tagName === "h3") {
      const subsubsectionSpec = {href, tag, content, childSpecs: []};
      currentSubsectionSpec?.childSpecs.push(subsubsectionSpec);
    }
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
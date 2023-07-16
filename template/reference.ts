//

import type {
  ReferenceSectionSpec,
  ReferenceTermSpec
} from "../generator/service/reference";
import {
  AvendiaTemplateManager
} from "../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("page", "reference-section", (transformer, document, element) => {
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
    const href = (tag) ? baseHref + "#" + tag : "";
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

manager.registerElementRule(true, "reference-section", (transformer, document) => {
  return document.createDocumentFragment();
});

manager.registerTextRule("reference-section", (transformer, document) => {
  return document.createDocumentFragment();
});

manager.registerElementRule("page", "reference-term", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const path = transformer.variables.path;
  const language = transformer.variables.language;
  const splitRelativePath = transformer.environments.configs.getSplitRelativeDocumentPath(path, language);
  const baseHref = splitRelativePath[splitRelativePath.length - 1].replace(/\.zml/, ".html");
  const termElements = element.searchXpath("//rterm") as Array<Element>;
  const termSpecs = [] as Array<ReferenceTermSpec>;
  for (const termElement of termElements) {
    const key = termElement.getAttribute("key");
    const id = termElement.getAttribute("id");
    const href = (id) ? baseHref + "#" + id : "";
    const content = transformer.apply(termElement, "page").toString();
    termSpecs.push({href, key, id, content});
  }
  self.appendTextNode(JSON.stringify(termSpecs), (self) => self.options.raw = true);
  return self;
});

manager.registerElementRule(true, "reference-term", (transformer, document) => {
  return document.createDocumentFragment();
});

manager.registerTextRule("reference-term", (transformer, document) => {
  return document.createDocumentFragment();
});

export default manager;
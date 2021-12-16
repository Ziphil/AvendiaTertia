//

import {
  TemplateManager
} from "@zenml/zenml";
import {
  AVENDIA_CONFIGS
} from "../generator/configs";
import type {
  AvendiaDocument
} from "../generator/dom";
import type {
  AvendiaTransformerEnvironments,
  AvendiaTransformerVariables
} from "../generator/transformer";
import TRANSLATIONS from "./translations.json";


const ANY_TRANSLATIONS = TRANSLATIONS as any;
let manager = new TemplateManager<AvendiaDocument, AvendiaTransformerEnvironments, AvendiaTransformerVariables>();

manager.registerElementFactory("navigation", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  let path = transformer.variables.path;
  let language = transformer.variables.language;
  let splitRelativePath = AVENDIA_CONFIGS.getSplitRelativeDocumentPath(path, language);
  let depth = splitRelativePath.length - 1;
  let virtualDepth = (path.match(/index\.zml$/)) ? depth - 1 : depth;
  let title = "";
  self.appendChild(document.createBreadcrumb((self) => {
    self.addClassName("navigation-list");
    if (virtualDepth >= -1) {
      self.appendChild(document.createBreadcrumbItem(1, (itemSelf, linkSelf, nameSelf) => {
        itemSelf.addClassName("navigation-item");
        linkSelf.setAttribute("href", "/");
        nameSelf.appendTextNode(TRANSLATIONS.top[language]);
      }));
    }
    if (virtualDepth >= 0) {
      let firstCategory = splitRelativePath[0];
      self.appendChild(document.createBreadcrumbItem(2, (itemSelf, linkSelf, nameSelf) => {
        itemSelf.addClassName("navigation-item");
        linkSelf.setAttribute("href", "/" + firstCategory);
        nameSelf.appendTextNode(ANY_TRANSLATIONS[firstCategory]["index"][language]);
      }));
    }
    if (virtualDepth >= 1) {
      let firstCategory = splitRelativePath[0];
      let secondCategory = splitRelativePath[1];
      self.appendChild(document.createBreadcrumbItem(3, (itemSelf, linkSelf, nameSelf) => {
        itemSelf.addClassName("navigation-item");
        linkSelf.setAttribute("href", "/" + firstCategory + "/" + secondCategory);
        nameSelf.appendTextNode(ANY_TRANSLATIONS[firstCategory][secondCategory][language]);
      }));
    }
    if (virtualDepth >= 2) {
      let convertedPath = path.match(/([0-9a-z\-]+)\.zml$/)![1] + ((element.getAttribute("link") === "c") ? ".cgi" : ".html");
      let nameElement = element.getChildElements("name")[0];
      if (nameElement !== undefined) {
        title = nameElement.textContent ?? title;
        self.appendChild(document.createBreadcrumbItem(4, (itemSelf, linkSelf, nameSelf) => {
          itemSelf.addClassName("navigation-item");
          linkSelf.setAttribute("href", convertedPath);
          nameSelf.appendChild(transformer.apply(nameElement!, "page"));
        }));
      }
    }
  }));
  transformer.variables.title = title;
  transformer.variables.pageTitle = ((title) ? title + " — " : "") + TRANSLATIONS.title[language];
  return self;
});

manager.registerElementRule("ver", "navigation", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("div", (self) => {
    let content = element.textContent;
    if (content === "*" || content?.match(/(5\s*代\s*5\s*期|S\s*代|Version\s*5\.5|Version\s*S)/)) {
      self.addClassName("version");
      transformer.variables.latest = true;
    } else {
      self.addClassName("version caution");
    }
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

manager.registerElementRule(true, "navigation", (transformer, document) => {
  return document.createDocumentFragment();
});

manager.registerTextRule("navigation", (transformer, document) => {
  return document.createDocumentFragment();
});

export default manager;
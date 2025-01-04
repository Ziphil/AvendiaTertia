//

import {AvendiaTemplateManager} from "../generator/transformer";
import TRANSLATIONS from "~/template/translations.json";


const manager = new AvendiaTemplateManager();

manager.registerElementFactory("navigation", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const path = transformer.variables.path;
  const language = transformer.variables.language;
  const splitRelativePath = transformer.environments.configs.getSplitRelativeDocumentPath(path, language);
  const depth = splitRelativePath.length - 1;
  const virtualDepth = (path.match(/index\.zml$/)) ? depth - 1 : depth;
  let title = "";
  self.appendChild(document.createBreadcrumb((self) => {
    self.addClassName("navigation-list");
    if (virtualDepth >= -1) {
      self.appendChild(document.createBreadcrumbItem(1, (itemSelf, linkSelf, nameSelf) => {
        itemSelf.addClassName("navigation-item");
        linkSelf.addClassName("navigation-link");
        linkSelf.setAttribute("href", "/");
        nameSelf.appendTextNode(TRANSLATIONS.page.top[language]);
      }));
    }
    if (virtualDepth >= 0) {
      const firstCategory = splitRelativePath[0];
      self.appendChild(document.createBreadcrumbItem(2, (itemSelf, linkSelf, nameSelf) => {
        itemSelf.addClassName("navigation-item");
        linkSelf.addClassName("navigation-link");
        linkSelf.setAttribute("href", "/" + firstCategory);
        nameSelf.appendTextNode(TRANSLATIONS.page[firstCategory]!.index![language]);
      }));
    }
    if (virtualDepth >= 1) {
      const firstCategory = splitRelativePath[0];
      const secondCategory = splitRelativePath[1];
      self.appendChild(document.createBreadcrumbItem(3, (itemSelf, linkSelf, nameSelf) => {
        itemSelf.addClassName("navigation-item");
        linkSelf.addClassName("navigation-link");
        linkSelf.setAttribute("href", "/" + firstCategory + "/" + secondCategory);
        nameSelf.appendTextNode(TRANSLATIONS.page[firstCategory]![secondCategory]![language]);
      }));
    }
    if (virtualDepth >= 2) {
      const convertedPath = path.match(/([0-9a-z\-]+)\.zml$/)![1] + ((element.getAttribute("link") === "c") ? ".cgi" : ".html");
      const nameElement = element.getChildElements("name")[0];
      if (nameElement !== undefined) {
        title = nameElement.textContent ?? title;
        self.appendChild(document.createBreadcrumbItem(4, (itemSelf, linkSelf, nameSelf) => {
          itemSelf.addClassName("navigation-item");
          linkSelf.addClassName("navigation-link");
          linkSelf.setAttribute("href", convertedPath);
          nameSelf.appendChild(transformer.apply(nameElement, "page"));
        }));
      }
    }
  }));
  transformer.variables.title = title;
  transformer.variables.pageTitle = ((title) ? title + " — " : "") + TRANSLATIONS.title[language];
  return self;
});

manager.registerElementRule("ver", "navigation", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("div", (self) => {
    self.addClassName("navigation-version");
    const content = element.textContent;
    if (content === "*" || content?.match(/(7\s*代|Version\s*([0-9\.]+–)?7)\s*$/) || content?.match(/(7\s*代\s*2\s*期|Version\s*([0-9\.]+–)?7\.2)\s*$/)) {
      transformer.variables.version = content;
      transformer.variables.latest = true;
    } else {
      self.setAttribute("data-caution", "");
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
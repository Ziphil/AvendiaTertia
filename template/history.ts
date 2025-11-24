//

import {AvendiaTemplateManager} from "../generator/transformer";
import TRANSLATIONS from "~/template/translations.json";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("page", "history", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const path = transformer.variables.path;
  const language = transformer.variables.language;
  const splitRelativePath = transformer.environments.configs.getSplitRelativeDocumentPath(path, language);
  const depth = splitRelativePath.length - 1;
  const virtualDepth = (path.match(/index\.zml$/)) ? depth - 1 : depth;
  let title = "";
  self.appendElement("ul", (self) => {
    self.addClassName("navigation-list");
    if (virtualDepth >= -1) {
      self.appendElement("li", (self) => {
        self.addClassName("navigation-item");
        self.appendTextNode(TRANSLATIONS.page.top[language]);
      });
    }
    if (virtualDepth >= 0) {
      const firstCategory = splitRelativePath[0];
      self.appendElement("li", (self) => {
        self.addClassName("navigation-item");
        self.appendTextNode(TRANSLATIONS.page[firstCategory]!.index![language]);
      });
    }
    if (virtualDepth >= 1) {
      const firstCategory = splitRelativePath[0];
      const secondCategory = splitRelativePath[1];
      self.appendElement("li", (self) => {
        self.addClassName("navigation-item");
        self.appendTextNode(TRANSLATIONS.page[firstCategory]![secondCategory]![language]);
      });
    }
    if (virtualDepth >= 2) {
      const firstCategory = splitRelativePath[0];
      const secondCategory = splitRelativePath[1];
      const convertedPath = path.match(/([0-9a-z\-]+)\.zml$/)![1] + ((element.getAttribute("link") === "c") ? ".cgi" : ".html");
      const nameElement = element.getChildElements("name")[0];
      if (nameElement !== undefined) {
        title = nameElement.textContent ?? title;
        self.appendElement("li", (self) => {
          self.addClassName("navigation-item");
          self.appendElement("a", (self) => {
            self.addClassName("navigation-link");
            self.setAttribute("href", "/" + firstCategory + "/" + secondCategory + "/" + convertedPath);
            self.appendChild(transformer.apply(nameElement, "page"));
          });
        });
      }
    }
  });
  return self;
});

manager.registerElementRule(true, "history", (transformer, document) => {
  return document.createDocumentFragment();
});

manager.registerTextRule("history", (transformer, document) => {
  return document.createDocumentFragment();
});

export default manager;
//

import {
  AVENDIA_CONFIGS
} from "../generator/configs";
import {
  AvendiaTemplateManager
} from "../generator/transformer";
import TRANSLATIONS from "~/template/translations.json";


let manager = new AvendiaTemplateManager();

manager.registerElementRule("page", "history", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  let path = transformer.variables.path;
  let language = transformer.variables.language;
  let splitRelativePath = AVENDIA_CONFIGS.getSplitRelativeDocumentPath(path, language);
  let depth = splitRelativePath.length - 1;
  let virtualDepth = (path.match(/index\.zml$/)) ? depth - 1 : depth;
  let title = "";
  self.appendElement("ul", (self) => {
    self.addClassName("navigation-list");
    if (virtualDepth >= -1) {
      self.appendElement("li", (itemSelf) => {
        itemSelf.addClassName("navigation-item");
        itemSelf.appendTextNode(TRANSLATIONS.page.top[language]);
      });
    }
    if (virtualDepth >= 0) {
      let firstCategory = splitRelativePath[0];
      self.appendElement("li", (itemSelf) => {
        itemSelf.addClassName("navigation-item");
        itemSelf.appendTextNode(TRANSLATIONS.page[firstCategory]!.index![language]);
      });
    }
    if (virtualDepth >= 1) {
      let firstCategory = splitRelativePath[0];
      let secondCategory = splitRelativePath[1];
      self.appendElement("li", (itemSelf) => {
        itemSelf.addClassName("navigation-item");
        itemSelf.appendTextNode(TRANSLATIONS.page[firstCategory]![secondCategory]![language]);
      });
    }
    if (virtualDepth >= 2) {
      let convertedPath = path.match(/([0-9a-z\-]+)\.zml$/)![1] + ((element.getAttribute("link") === "c") ? ".cgi" : ".html");
      let nameElement = element.getChildElements("name")[0];
      if (nameElement !== undefined) {
        title = nameElement.textContent ?? title;
        self.appendElement("li", (itemSelf) => {
          itemSelf.addClassName("navigation-item");
          self.appendElement("a", (linkSelf) => {
            linkSelf.addClassName("navigation-link");
            linkSelf.setAttribute("href", convertedPath);
            linkSelf.appendChild(transformer.apply(nameElement!, "page"));
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
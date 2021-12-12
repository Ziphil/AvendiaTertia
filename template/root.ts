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
  AvendiaTransformerVariables
} from "../generator/transformer";
import TRANSLATIONS from "./translations.json";


const ANY_TRANSLATIONS = TRANSLATIONS as any;
let manager = new TemplateManager<AvendiaDocument, {}, AvendiaTransformerVariables>();

manager.registerElementRule("page", "", (transformer, document, element) => {
  let path = transformer.variables.path;
  let language = transformer.variables.language;
  let splitRelativePath = AVENDIA_CONFIGS.getSplitRelativeDocumentPath(path, language);
  let depth = splitRelativePath.length - 1;
  let virtualDepth = (path.match(/index\.zml$/)) ? depth - 1 : depth;
  let articleType = (depth >= 1 && depth <= 2 && path.match(/index\.zml$/)) ? "content-table" : "main";
  let title = "";
  let navigationNode = document.createDocumentFragment();
  let headerNode = document.createDocumentFragment();
  let mainNode = document.createDocumentFragment();
  navigationNode.appendChild(document.createBreadcrumb((self) => {
    self.addClassName("breadcrumb");
    if (virtualDepth >= -1) {
      self.appendChild(document.createBreadcrumbItem(1, (itemSelf, linkSelf, nameSelf) => {
        linkSelf.setAttribute("href", "/");
        nameSelf.appendTextNode(TRANSLATIONS.top[language]);
      }));
    }
    if (virtualDepth >= 0) {
      let firstCategory = splitRelativePath[0];
      self.appendChild(document.createBreadcrumbItem(2, (itemSelf, linkSelf, nameSelf) => {
        linkSelf.setAttribute("href", "/" + firstCategory);
        nameSelf.appendTextNode(ANY_TRANSLATIONS[firstCategory]["index"][language]);
      }));
    }
    if (virtualDepth >= 1) {
      let firstCategory = splitRelativePath[0];
      let secondCategory = splitRelativePath[1];
      self.appendChild(document.createBreadcrumbItem(3, (itemSelf, linkSelf, nameSelf) => {
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
          linkSelf.setAttribute("href", convertedPath);
          nameSelf.appendChild(transformer.apply(nameElement!, "page"));
        }));
      }
    }
  }));
  transformer.variables.foreignLanguage = (language === "ja") ? "en" : "ja";
  transformer.variables.title = title;
  transformer.variables.pageTitle = ((title) ? title + " — " : "") + TRANSLATIONS.title[language];
  navigationNode.appendChild(transformer.apply(element, "navigation"));
  headerNode.appendChild(transformer.apply(element, "header"));
  mainNode.appendChild(transformer.apply(element, "page"));
  transformer.variables.articleType = articleType;
  transformer.variables.navigationNode = navigationNode;
  transformer.variables.headerNode = headerNode;
  return mainNode;
});

export default manager;
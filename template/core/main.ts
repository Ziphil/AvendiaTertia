//

import {AvendiaOutputLanguage} from "generator/configs";
import {AvendiaLightTransformer, AvendiaTemplateManager} from "../../generator/transformer";


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

manager.registerElementFactory("core-main", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const path = transformer.variables.path;
  const language = transformer.variables.language;
  const transparent = getTransparent(path, language, transformer);
  self.appendChild(transformer.call("series", element));
  self.appendElement("article", (self) => {
    self.addClassName("main");
    self.appendElement("div", (self) => {
      self.addClassName("main-inner");
      if (transparent) {
        self.setAttribute("data-transparent", "");
      }
      self.appendChild(transformer.apply(element, "page"));
    });
  });
  return self;
});

manager.registerElementFactory("series", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const seriesElement = element.searchXpath("/page/series")[0] as Element | undefined;
  if (seriesElement !== undefined) {
    const number = seriesElement.getAttribute("num");
    const previousHref = seriesElement.getAttribute("prev");
    const nextHref = seriesElement.getAttribute("next");
    self.appendElement("nav", (self) => {
      self.addClassName("series");
      self.appendElement("div", (self) => {
        self.addClassName("series-inner");
        self.appendElement("div", (self) => {
          self.addClassName("series-main");
          self.appendElement("div", (self) => {
            self.addClassName("series-number");
            self.appendElement("span", (self) => {
              self.addClassName("series-number-mark");
              self.appendTextNode("#");
            });
            self.appendTextNode(number);
          });
          self.appendElement("div", (self) => {
            self.addClassName("series-title");
            self.appendElement("div", (self) => {
              self.addClassName("series-title-label");
              self.appendTextNode("シリーズ");
            });
            self.appendElement("div", (self) => {
              self.addClassName("series-title-name");
              self.appendChild(transformer.apply(seriesElement, "page"));
            });
          });
        });
        self.appendElement("div", (self) => {
          self.addClassName("series-link-list");
          if (previousHref) {
            self.appendElement("a", (self) => {
              self.addClassName("series-link-item");
              self.setAttribute("data-direction", "previous");
              self.setAttribute("href", previousHref);
              self.appendTextNode("前へ");
            });
          } else {
            self.appendElement("div", (self) => {
              self.addClassName("series-link-item");
              self.setAttribute("data-direction", "previous");
              self.setAttribute("data-disabled", "");
              self.appendTextNode("前へ");
            });
          }
          if (nextHref) {
            self.appendElement("a", (self) => {
              self.addClassName("series-link-item");
              self.setAttribute("data-direction", "next");
              self.setAttribute("href", nextHref);
              self.appendTextNode("次へ");
            });
          } else {
            self.appendElement("div", (self) => {
              self.addClassName("series-link-item");
              self.setAttribute("data-direction", "next");
              self.setAttribute("data-disabled", "");
              self.appendTextNode("次へ");
            });
          }
        });
      });
    });
  }
  return self;
});

export default manager;
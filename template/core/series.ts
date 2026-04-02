//

import {AvendiaTemplateManager} from "../../generator/transformer";


const manager = new AvendiaTemplateManager();

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
//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";


let manager = new AvendiaTemplateManager();

manager.registerElementRule("section-table", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("ul", (self) => {
    self.addClassName("normal-list");
    self.setBlockType("text", "text");
    self.setAttribute("data-type", "unordered");
    self.setAttribute("data-column", "2");
    let sectionSelf = document.createElement("li");
    let subsectionSelf = document.createElement("ul", (self) => self.addClassName("normal-list"));
    let hasSection = false;
    let hasSubsection = false;
    let sectionElements = element.searchXpath("/page/*[name() = 'h1' or name() = 'h2']") as Array<Element>;
    for (let sectionElement of sectionElements) {
      if (sectionElement.tagName === "h1") {
        if (hasSection) {
          if (hasSubsection) {
            sectionSelf.appendChild(subsectionSelf);
          }
          self.appendChild(sectionSelf);
        }
        hasSection = true;
        sectionSelf = document.createElement("li", (self) => {
          self.addClassName("normal-item");
          if (sectionElement.hasAttribute("id")) {
            self.appendElement("a", (self) => {
              self.addClassName("link");
              self.setAttribute("href", "#" + sectionElement.getAttribute("id"));
              self.appendChild(transformer.apply(sectionElement, "page.section-table"));
            });
          } else {
            self.appendChild(transformer.apply(sectionElement, "page.section-table"));
          }
        });
        subsectionSelf = document.createElement("ul", (self) => self.addClassName("normal-list"));
      } else if (sectionElement.tagName === "h2") {
        hasSubsection = true;
        subsectionSelf.appendElement("li", (self) => {
          self.addClassName("normal-item");
          if (sectionElement.hasAttribute("num")) {
            self.appendElement("span", (self) => {
              self.addClassName("section-table-number");
              self.appendTextNode("§" + sectionElement.getAttribute("num") + ".");
            });
            self.appendElement("a", (self) => {
              self.addClassName("link");
              self.setAttribute("href", "#" + sectionElement.getAttribute("num"));
              self.appendChild(transformer.apply(sectionElement, "page.section-table"));
            });
          } else if (sectionElement.hasAttribute("id")) {
            self.appendElement("a", (self) => {
              self.addClassName("link");
              self.setAttribute("href", "#" + sectionElement.getAttribute("id"));
              self.appendChild(transformer.apply(sectionElement, "page.section-table"));
            });
          } else {
            self.appendChild(transformer.apply(sectionElement, "page.section-table"));
          }
        });
      }
    }
    if (hasSubsection) {
      sectionSelf.appendChild(subsectionSelf);
    }
    self.appendChild(sectionSelf);
  });
  return self;
});

export default manager;
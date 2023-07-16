//

import type {
  AvendiaDocumentFragment,
  AvendiaElement
} from "../../generator/dom";
import type {
  ReferenceSectionSpec
} from "../../generator/service/reference";
import {
  AvendiaTemplateManager
} from "../../generator/transformer";
import {
  getReferenceIndex
} from "../../template/util";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("reference-section-table", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const sectionSpecs = getReferenceIndex(transformer).section.specs;
  const appendIndexList = function (self: AvendiaDocumentFragment | AvendiaElement, sectionSpecs: Array<ReferenceSectionSpec>, inner?: boolean): void {
    self.appendElement("ul", (self) => {
      self.addClassName("normal-list");
      self.setBlockType("text", "text");
      if (!inner) {
        self.setAttribute("data-type", "unordered");
        self.setAttribute("data-column", "2");
      }
      for (const sectionSpec of sectionSpecs) {
        self.appendElement("li", (self) => {
          self.addClassName("normal-item");
          if (sectionSpec.tag) {
            self.appendElement("span", (self) => {
              self.addClassName("section-table-tag");
              self.appendTextNode("#" + sectionSpec.tag.toUpperCase() + ".");
            });
          }
          if (sectionSpec.href) {
            self.appendElement("a", (self) => {
              self.addClassName("link");
              self.setAttribute("href", sectionSpec.href);
              self.appendTextNode(sectionSpec.content, (self) => self.options.raw = true);
            });
          } else {
            self.appendTextNode(sectionSpec.content, (self) => self.options.raw = true);
          }
          if (sectionSpec.childSpecs.length > 0) {
            appendIndexList(self, sectionSpec.childSpecs, true);
          }
        });
      }
    });
  };
  for (const documentSpec of sectionSpecs) {
    self.appendElement("h2", (self) => {
      self.addClassName("subsection");
      self.setAttribute("data-section", "");
      self.setBlockType("bordered", "bordered");
      self.appendElement("div", (self) => {
        self.addClassName("subsection-inner");
        self.appendTextNode(documentSpec.content, (self) => self.options.raw = true);
      });
    });
    appendIndexList(self, documentSpec.childSpecs);
  }
  return self;
});

manager.registerElementRule("reference-term-table", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const initialedTermSpecs = getReferenceIndex(transformer).term.specs;
  for (const initialedTermSpec of initialedTermSpecs) {
    self.appendElement("h2", (self) => {
      self.addClassName("subsection");
      self.setAttribute("data-section", "");
      self.setBlockType("bordered", "bordered");
      self.appendElement("div", (self) => {
        self.addClassName("subsection-inner");
        self.appendTextNode(initialedTermSpec.text);
      });
    });
    self.appendElement("ul", (self) => {
      self.addClassName("normal-list");
      self.setBlockType("text", "text");
      self.setAttribute("data-type", "unordered");
      self.setAttribute("data-column", "2");
      for (const termSpec of initialedTermSpec.specs) {
        self.appendElement("li", (self) => {
          self.addClassName("normal-item");
          if (termSpec.href) {
            self.appendElement("a", (self) => {
              self.addClassName("link");
              self.setAttribute("href", termSpec.href);
              self.appendTextNode(termSpec.content, (self) => self.options.raw = true);
            });
          } else {
            self.appendTextNode(termSpec.content, (self) => self.options.raw = true);
          }
        });
      }
    });
  }
  return self;
});

export default manager;
//

import fs from "fs";
import type {
  SectionSpec
} from "../../generator/service/reference";
import {
  AvendiaTemplateManager
} from "../../generator/transformer";


let manager = new AvendiaTemplateManager();

manager.registerElementRule("reference-table", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  let language = transformer.variables.language;
  let indexPath = transformer.environments.configs.getReferenceIndexPath(language);
  let documentSpecs = JSON.parse(fs.readFileSync(indexPath, {encoding: "utf-8"})) as Array<SectionSpec>;
  for (let documentSpec of documentSpecs) {
    self.appendElement("h2", (self) => {
      self.addClassName("subsection");
      self.setBlockType("text", "bordered");
      self.appendElement("div", (self) => {
        self.addClassName("subsection-inner");
        self.appendTextNode(documentSpec.content, (self) => self.options.raw = true);
      });
    });
    self.appendElement("ul", (self) => {
      self.addClassName("normal-list");
      self.setBlockType("text", "text");
      self.setAttribute("data-type", "unordered");
      self.setAttribute("data-column", "2");
      for (let sectionSpec of documentSpec.childSpecs) {
        self.appendElement("li", (self) => {
          self.addClassName("normal-item");
          self.appendElement("span", (self) => {
            self.addClassName("section-table-tag");
            self.setAttribute("data-tag", sectionSpec.tag.toUpperCase());
          });
          self.appendElement("a", (self) => {
            self.addClassName("link");
            self.setAttribute("href", sectionSpec.href + "#" + sectionSpec.tag);
            self.appendTextNode(sectionSpec.content, (self) => self.options.raw = true);
          });
          if (sectionSpec.childSpecs.length > 0) {
            self.appendElement("ul", (self) => {
              self.addClassName("normal-list");
              for (let subsectionSpec of sectionSpec.childSpecs) {
                self.appendElement("li", (self) => {
                  self.addClassName("normal-item");
                  self.appendElement("span", (self) => {
                    self.addClassName("section-table-tag");
                    self.setAttribute("data-tag", subsectionSpec.tag.toUpperCase());
                  });
                  self.appendElement("a", (self) => {
                    self.addClassName("link");
                    self.setAttribute("href", subsectionSpec.href + "#" + subsectionSpec.tag);
                    self.appendTextNode(subsectionSpec.content, (self) => self.options.raw = true);
                  });
                });
              }
            });
          }
        });
      }
    });
  }
  return self;
});

export default manager;
//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule(["pre", "samp"], "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const lineTagName = (element.tagName === "pre") ? "code" : "samp";
  const lines = element.textContent?.split("\n") ?? [];
  const showNumber = element.tagName === "pre" && !element.hasAttribute("simple");
  self.appendElement("div", (self) => {
    self.addClassName("program-container");
    self.setBlockType("bordered", "bordered");
    self.setAttribute("data-type", element.tagName);
    self.appendElement("div", (self) => {
      self.addClassName("program-inner-container");
      self.appendElement("div", (self) => {
        self.addClassName("program");
        if (showNumber) {
          self.setAttribute("data-show-number", "");
        }
        for (let index = 0 ; index < lines.length ; index ++) {
          const line = lines[index];
          if (showNumber) {
            self.appendElement("div", (self) => {
              self.addClassName("program-number");
              self.setAttribute("data-number", (index + 1).toString());
            });
          }
          self.appendElement(lineTagName, (self) => {
            self.addClassName("program-line");
            self.appendTextNode(line);
          });
        }
      });
    });
  });
  return self;
});

export default manager;
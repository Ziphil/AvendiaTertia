//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";


let manager = new AvendiaTemplateManager();

manager.registerElementRule(["pre", "samp"], "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  let lineTagName = (element.tagName === "pre") ? "code" : "samp";
  let lines = element.textContent?.split("\n") ?? [];
  let showNumber = element.tagName === "pre" && !element.hasAttribute("simple");
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
        for (let number = 0 ; number < lines.length ; number ++) {
          let line = lines[number];
          if (showNumber) {
            self.appendElement("div", (self) => {
              self.addClassName("program-number");
              self.setAttribute("data-number", (number + 1).toString());
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
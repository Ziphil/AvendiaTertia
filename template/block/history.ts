//

import fs from "fs";
import {
  AVENDIA_CONFIGS
} from "../../generator/configs";
import {
  AvendiaTemplateManager
} from "../../generator/transformer";


let manager = new AvendiaTemplateManager();

manager.registerElementRule("history", ["page", "html"], (transformer, document, element) => {
  let self = document.createDocumentFragment();
  let language = transformer.variables.language;
  let size = parseInt(element.getAttribute("size"));
  let logPath = AVENDIA_CONFIGS.getLogPath(language);
  let entries = fs.readFileSync(logPath, {encoding: "utf-8"}).trim().split("\n").reverse().slice(0, size);
  self.appendElement("ul", (self) => {
    self.addClassName("history-list");
    self.setBlockType("text", "text");
    for (let entry of entries) {
      let [dateString, content] = entry.split(/\s*;\s*/, 2);
      self.appendElement("li", (self) => {
        self.addClassName("history-item");
        self.appendElement("span", (self) => {
          self.addClassName("history-date");
          self.appendTextNode(dateString);
        });
        self.appendTextNode(content, (self) => self.options.raw = true);
      });
    }
  });
  return self;
});

export default manager;
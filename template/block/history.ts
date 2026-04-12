//

import fs from "fs";
import {AvendiaTemplateManager} from "../../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("history", ["page", "html"], (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const language = transformer.variables.language;
  const size = parseInt(element.getAttribute("size"));
  const scheme = element.getAttribute("scheme") || null;
  const indexPath = transformer.environments.configs.getHistoryIndexPath(language);
  const entries = fs.readFileSync(indexPath, {encoding: "utf-8"}).trim().split("\n").reverse().map((entry) => entry.split(/\s*;\s*/, 3));
  const filteredEntries = entries.filter((entry) => scheme === null || entry[1] === scheme).slice(0, size);
  self.appendElement("ul", (self) => {
    self.addClassName("history-list");
    self.setBlockType("text", "text");
    for (const [dateString, , content] of filteredEntries) {
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
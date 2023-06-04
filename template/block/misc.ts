//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("todo", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("div", (self) => {
    self.addClassName("todo");
    self.setBlockType("bordered", "bordered");
    self.appendElement("p", (self) => {
      self.addClassName("todo-inner");
      self.appendChild(transformer.apply());
    });
  });
  return self;
});

export default manager;
//

import {AvendiaTemplateManager} from "../../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("cn", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("cuneiform");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("cnbr", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("cuneiform-break");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("cns", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("cuneiform-sentence");
    self.appendChild(transformer.apply());
  });
  return self;
});

export default manager;
//

import {AvendiaTemplateManager} from "../../generator/transformer";
import {getNumber, setNumber} from "../util";
import TRANSLATIONS from "~/template/translations.json";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("thm", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const id = element.getAttribute("id");
  const nameElement = element.getChildElements("name")[0];
  setNumber(transformer, element, "theorem", id);
  self.appendElement("div", (self) => {
    self.addClassName("theorem");
    self.setBlockType("bordered", "bordered");
    if (element.hasAttribute("id")) {
      self.setAttribute("id", id);
    }
    self.appendElement("span", (self) => {
      self.addClassName("theorem-number-wrapper");
      self.appendElement("span", (self) => {
        self.addClassName("theorem-number");
        self.appendTextNode(getNumber(transformer, element, "theorem", true, id));
      });
      if (nameElement !== undefined) {
        self.appendElement("span", (self) => {
          self.addClassName("theorem-name");
          self.appendTextNode(" [");
          self.appendChild(transformer.apply(nameElement));
          self.appendTextNode("]");
        });
      }
      self.appendTextNode(".");
    });
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("prf", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("div", (self) => {
    self.addClassName("proof");
    self.setBlockType("text", "text");
    self.appendElement("span", (self) => {
      self.addClassName("proof-label");
      self.appendTextNode(TRANSLATIONS.math.proof[transformer.variables.language]);
      self.appendTextNode(".");
    });
    self.appendChild(transformer.apply());
  });
  return self;
});

export default manager;
//

import {AvendiaTemplateManager} from "../../generator/transformer";


const GREEK_DIACRITICS = new Map([["a", "´"], ["g", "`"], ["s", "᾿"], ["sa", "῎"], ["sg", "῍"], ["r", "῾"], ["ra", "῞"], ["rg", "῝"], ["i", "ι"]]);

const manager = new AvendiaTemplateManager();

manager.registerElementRule("gd", ["page", "page.section-table"], (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const diacriticType = element.getAttribute("d");
  self.appendElement("span", (self) => {
    self.addClassName("greek");
    self.appendElement("span", (self) => {
      self.addClassName("greek-char");
      self.appendChild(transformer.apply(element, "page"));
    });
    if (diacriticType.replace("i", "") !== "") {
      self.appendElement("span", (self) => {
        self.addClassName("greek-diacritic");
        self.setAttribute("data-position", "above");
        self.appendTextNode(GREEK_DIACRITICS.get(diacriticType.replace("i", "")) ?? "");
      });
    }
    if (diacriticType.includes("i")) {
      self.appendElement("span", (self) => {
        self.addClassName("greek-diacritic");
        self.setAttribute("data-position", "below");
        self.appendTextNode(GREEK_DIACRITICS.get("i")!);
      });
    }
  });
  return self;
});

export default manager;
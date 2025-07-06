//

import {convertExtendedMdcToUnicode} from "hieroglyph-utils";
import {AvendiaTemplateManager} from "../../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("cns", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("cuneiform-sentence");
    self.appendChild(transformer.apply());
  });
  return self;
});

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

manager.registerElementRule("hrs", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("hieroglyph-sentence");
    self.appendElement("span", (self) => {
      self.addClassName("hierojax");
      self.setAttribute("data-type", "svg");
      self.setAttribute("data-separated", "true");
      if (element.hasAttribute("rtl")) {
        self.setAttribute("data-dir", "hrl");
      }
      self.appendTextNode(convertExtendedMdcToUnicode(element.textContent ?? ""));
    });
  });
  return self;
});

manager.registerElementRule("hr", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("hieroglyph");
    self.appendElement("span", (self) => {
      self.addClassName("hierojax");
      self.setAttribute("data-type", "svg");
      self.setAttribute("data-separated", "true");
      if (element.hasAttribute("rtl")) {
        self.setAttribute("data-dir", "hrl");
      }
      self.appendTextNode(convertExtendedMdcToUnicode(element.textContent ?? ""));
    });
  });
  return self;
});

export default manager;
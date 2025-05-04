//

import {AvendiaTemplateManager} from "../../generator/transformer";
import HIEROGLYPH_DATA from "../hieroglyph.json";


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
      self.appendTextNode(convertExtendedMdc(element.textContent ?? ""));
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
      self.appendTextNode(convertExtendedMdc(element.textContent ?? ""));
    });
  });
  return self;
});

function convertExtendedMdc(string: string): string {
  const result = string.split(/(\s|-|:|\*|\(|\)|<|>|@\w+?@)/).map((part) => {
    if (part.match(/\s/) || part === "-") {
      return "";
    } else if (part === ":") {
      return "\uD80D\uDC30";
    } else if (part === "*") {
      return "\uD80D\uDC31";
    } else if (part === "(") {
      return "\uD80D\uDC37";
    } else if (part === ")") {
      return "\uD80D\uDC38";
    } else if (part === "<") {
      return "\uD80C\uDF79\uD80D\uDC3C";
    } else if (part === ">") {
      return "\uD80D\uDC3D\uD80C\uDF7A";
    } else if (part === "@TS@") {
      return "\uD80D\uDC32";
    } else if (part === "@BS@") {
      return "\uD80D\uDC33";
    } else if (part === "@TE@") {
      return "\uD80D\uDC34";
    } else if (part === "@BE@") {
      return "\uD80D\uDC35";
    } else if (part === "@M@") {
      return "\uD80D\uDC36";
    } else {
      return (HIEROGLYPH_DATA.glyphs as any)[part] ?? "";
    }
  });
  return result.join("");
}

export default manager;
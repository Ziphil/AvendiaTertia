//

import {AvendiaTemplateManager} from "../../generator/transformer";


const MUSIC_SYMBOL_SPECS = new Map([
  ["s", ["music-accidental", "sharp", "♯"]],
  ["f", ["music-accidental", "flat", "♭"]],
  ["n", ["music-accidental", "natural", "♮"]],
  ["maj", ["music-chord", "major", "Δ"]],
  ["min", ["music-chord", "minor", "-"]],
  ["aug", ["music-chord", "augmented", "+"]],
  ["dim", ["music-chord", "diminished", "o"]],
  ["hdim", ["music-chord", "half-diminished", "ø"]]
]);

const manager = new AvendiaTemplateManager();

manager.registerElementRule("ms", true, (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const rawType = element.getAttribute("t");
  const [className, type, text] = MUSIC_SYMBOL_SPECS.get(rawType)!;
  self.appendElement("span", (self) => {
    self.addClassName(className);
    self.setAttribute("data-type", type);
    self.appendTextNode(text);
  });
  return self;
});

manager.registerElementRule("mk", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("mark");
    self.appendTextNode("⁎");
  });
  return self;
});

manager.registerElementRule("rd", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("radical");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("sbr", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("superbreviation");
    self.appendElement("span", (self) => {
      self.addClassName("superbreviation-main");
      self.appendChild(transformer.apply());
    });
  });
  return self;
});

manager.registerElementRule("box", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("box");
    if (element.hasAttribute("num")) {
      self.appendTextNode(element.getAttribute("num"));
    }
    if (element.hasAttribute("tag")) {
      self.appendTextNode(element.getAttribute("tag").toUpperCase());
    }
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("label", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("label");
    self.appendChild(transformer.apply());
    self.appendTextNode(":");
  });
  return self;
});

export default manager;
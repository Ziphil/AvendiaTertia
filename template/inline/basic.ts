//

import {AvendiaTemplateManager} from "../../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("h", ["page", "page.section-table"], (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("hairia");
    self.appendElement("span", (self) => {
      self.addClassName("hairia-mark");
      self.appendTextNode("H");
    });
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("part", ["page", "page.section-table"], (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("part");
    self.appendElement("span", (self) => {
      self.addClassName("part-mark");
      self.appendTextNode("#");
    });
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("fl", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("foreign");
    self.appendTextNode(" (");
    self.appendChild(transformer.apply());
    self.appendTextNode(")");
  });
  return self;
});

manager.registerElementRule("small", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("small");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("lys", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("lyrics-space");
  });
  return self;
});

manager.registerElementRule("red", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("redaction");
    if (element.hasAttribute("len")) {
      const length = parseInt(element.getAttribute("len"));
      self.appendTextNode(" ".repeat(length));
    }
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("abbr", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("abbr", (self) => {
    self.addClassName("abbreviation");
    if (element.hasAttribute("full")) {
      const full = element.getAttribute("full");
      self.setAttribute("title", full);
    }
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("ch", true, (transformer, document, element) => {
  const self = document.createDocumentFragment();
  if (element.hasAttribute("c")) {
    const codePoint = parseInt(element.getAttribute("c"), 16);
    self.appendTextNode(String.fromCodePoint(codePoint));
  } else if (element.hasAttribute("n")) {
    const query = element.getAttribute("n");
    if (query === "nbsp") {
      self.appendTextNode(String.fromCodePoint(0xA0));
    }
  } else if (element.hasAttribute("dz")) {
    const query = element.getAttribute("dz");
    const kind = (query === "x") ? "ten" : "eleven";
    self.appendElement("span", (self) => {
      self.addClassName("dozenal");
      self.setAttribute("data-kind", kind);
      self.appendElement("span", (self) => {
        self.addClassName("dozenal-main");
        self.appendTextNode((query === "x") ? "↊" : "↋");
      });
      self.appendElement("span", (self) => {
        self.addClassName("dozenal-pseudo");
        self.setAttribute("aria-hidden", "true");
        self.appendTextNode((query === "x") ? "2" : "3");
      });
    });
  }
  return self;
});

const GENERAL_DIACRITICS = new Map([["a", "ˊ"], ["g", "ˋ"], ["c", "ˆ"]]);
const GREEK_DIACRITICS = new Map([["a", "´"], ["g", "`"], ["s", "᾿"], ["sa", "῎"], ["sg", "῍"], ["r", "῾"], ["ra", "῞"], ["rg", "῝"], ["i", "ͺ"]]);

manager.registerElementRule("d", true, (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const type = element.getAttribute("g") || element.getAttribute("t");
  self.appendElement("span", (self) => {
    self.addClassName("diacritic");
    self.appendElement("span", (self) => {
      self.addClassName("diacritic-char");
      self.appendChild(transformer.apply(element, "page"));
    });
    if (element.hasAttribute("t")) {
      self.appendElement("span", (self) => {
        self.addClassName("diacritic-mark");
        self.setAttribute("data-domain", "general");
        self.setAttribute("data-position", "above");
        self.appendTextNode(GENERAL_DIACRITICS.get(type) ?? "");
      });
    } else if (element.hasAttribute("g")) {
      if (type.replace("i", "") !== "") {
        self.appendElement("span", (self) => {
          self.addClassName("diacritic-mark");
          self.setAttribute("data-domain", "greek");
          self.setAttribute("data-position", "above");
          self.appendTextNode(GREEK_DIACRITICS.get(type.replace("i", "")) ?? "");
        });
      }
      if (type.includes("i")) {
        self.appendElement("span", (self) => {
          self.addClassName("diacritic-mark");
          self.setAttribute("data-domain", "greek");
          self.setAttribute("data-position", "below");
          self.appendTextNode(GREEK_DIACRITICS.get("i")!);
        });
      }
    }
  });
  return self;
});

export default manager;
//

import {AvendiaTemplateManager} from "../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("use-script", "header", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("script", (self) => {
    const content = element.textContent;
    if (content === null || content === "") {
      self.setAttribute("src", "/program/script/" + element.getAttribute("src"));
    } else {
      self.appendTextNode(content);
    }
  });
  self.appendTextNode("\n");
  return self;
});

manager.registerElementRule("use-hiero", "header", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("link", (self) => {
    self.setAttribute("rel", "stylesheet");
    self.setAttribute("type", "text/css");
    self.setAttribute("href", "https://nederhof.github.io/hierojax/hierojax.css");
  });
  self.appendElement("script", (self) => {
    self.setAttribute("type", "text/javascript");
    self.setAttribute("src", "https://nederhof.github.io/hierojax/hierojax.js");
  });
  self.appendElement("script", (self) => {
    self.setAttribute("type", "text/javascript");
    self.appendTextNode(`
      class CustomHieroJax extends HieroJax {
        startLoadingFonts() {
          const hierojax = this;
          this.fonts = [new FontFace("Hieroglyphic", "url(/material/font/gardiner.ttf)") ];
          this.nFonts = this.fonts.length;
          this.nFontsLoaded = 0;
          this.fonts.forEach((font) => {
            font.load().then((loadedFont) => {
              document.fonts.add(loadedFont);
              hierojax.nFontsLoaded ++;
            });
          });
        }
      }
      const h = new CustomHieroJax();
      window.addEventListener("DOMContentLoaded", () => {
        console.log("[Hierojax] Start", h);
        h.processFragments();
      });
    `, (self) => self.options.raw = true);
  });
  self.appendTextNode("\n");
  return self;
});


manager.registerElementRule("use-math", "header", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const mathStyleString = transformer.environments.mathStyleString;
  const mathScriptString = transformer.environments.mathScriptString;
  if (element.hasAttribute("prefix")) {
    transformer.variables.numberPrefix = element.getAttribute("prefix");
  }
  self.appendElement("style", (self) => {
    self.appendChild(document.createTextNode(mathStyleString, (self) => self.options.raw = true));
  });
  self.appendElement("script", (self) => {
    self.appendChild(document.createTextNode(mathScriptString, (self) => self.options.raw = true));
  });
  return self;
});

manager.registerElementRule("base", "header", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("base", (self) => {
    self.setAttribute("href", element.getAttribute("href"));
  });
  self.appendTextNode("\n");
  return self;
});

manager.registerElementRule(true, "header", (transformer, document) => {
  return document.createDocumentFragment();
});

manager.registerTextRule("header", (transformer, document) => {
  return document.createDocumentFragment();
});

export default manager;
//

import {AvendiaTemplateManager} from "../../generator/transformer";
import TRANSLATIONS from "~/template/translations.json";


const manager = new AvendiaTemplateManager();

manager.registerElementFactory("core-footer", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendChild(transformer.call("footer", element));
  return self;
});

manager.registerElementFactory("footer", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const scheme = transformer.variables.scheme;
  const language = transformer.variables.language;
  self.appendElement("footer", (self) => {
    self.addClassName("footer");
    self.appendElement("div", (self) => {
      self.addClassName("footer-inner");
      if (scheme === "other") {
        self.appendElement("p", (self) => {
          self.addClassName("footer-flavor");
          self.appendTextNode("Hic situs est omnis divisus in partes tres…");
        });
      }
      self.appendElement("nav", (self) => {
        self.addClassName("footer-site-list");
        self.appendElement("a", (self) => {
          self.addClassName("footer-site-item");
          self.setAttribute("href", "/shaleian/");
          self.appendElement("div", (self) => {
            self.addClassName("footer-site-title");
            self.setAttribute("data-scheme", "shaleian");
            self.appendElement("span", (self) => {
              self.addClassName("footer-site-title-text");
              self.setAttribute("data-size", "single");
              self.appendTextNode("Avendia");
            });
          });
          self.appendElement("div", (self) => {
            self.addClassName("footer-site-description");
            self.appendTextNode(TRANSLATIONS.label.shaleian![language]);
          });
        });
        self.appendElement("a", (self) => {
          self.addClassName("footer-site-item");
          self.setAttribute("href", "/fennese/");
          self.appendElement("div", (self) => {
            self.addClassName("footer-site-title");
            self.setAttribute("data-scheme", "fennese");
            self.appendElement("span", (self) => {
              self.addClassName("footer-site-title-text");
              self.setAttribute("data-size", "single");
              self.appendTextNode("Лофжучло");
            });
          });
          self.appendElement("div", (self) => {
            self.addClassName("footer-site-description");
            self.appendTextNode(TRANSLATIONS.label.fennese![language]);
          });
        });
        self.appendElement("a", (self) => {
          self.addClassName("footer-site-item");
          self.setAttribute("href", "/other/");
          self.appendElement("div", (self) => {
            self.addClassName("footer-site-title");
            self.setAttribute("data-scheme", "other");
            self.appendElement("span", (self) => {
              self.addClassName("footer-site-title-text");
              self.setAttribute("data-size", "small");
              self.appendTextNode("ΤΑ ΖΙΦΙΛΟΥ");
            });
            self.appendElement("span", (self) => {
              self.addClassName("footer-site-title-text");
              self.setAttribute("data-size", "large");
              self.appendTextNode("ΒΙΒΛΙΑ");
            });
          });
          self.appendElement("div", (self) => {
            self.addClassName("footer-site-description");
            self.appendTextNode(TRANSLATIONS.label.other![language]);
          });
        });
      });
      self.appendElement("address", (self) => {
        self.addClassName("footer-icon-list");
        self.appendElement("a", (self) => {
          self.addClassName("footer-icon-item");
          self.setAttribute("data-brand", "twitter");
          self.setAttribute("href", "https://twitter.com/Ziphil");
          self.setAttribute("target", "_blank");
          self.setAttribute("rel", "noopener noreferrer");
        });
        self.appendElement("a", (self) => {
          self.addClassName("footer-icon-item");
          self.setAttribute("data-brand", "youtube");
          self.setAttribute("href", "https://www.youtube.com/channel/UCF2sTP1NGBVFr79aJiKprsg/");
          self.setAttribute("target", "_blank");
          self.setAttribute("rel", "noopener noreferrer");
        });
        self.appendElement("a", (self) => {
          self.addClassName("footer-icon-item");
          self.setAttribute("data-brand", "discord");
          self.setAttribute("href", "https://discord.gg/qdRyE2ZExf");
          self.setAttribute("target", "_blank");
          self.setAttribute("rel", "noopener noreferrer");
        });
        self.appendElement("a", (self) => {
          self.addClassName("footer-icon-item");
          self.setAttribute("data-brand", "github");
          self.setAttribute("href", "https://github.com/Ziphil");
          self.setAttribute("target", "_blank");
          self.setAttribute("rel", "noopener noreferrer");
        });
      });
      self.appendElement("small", (self) => {
        self.addClassName("footer-copyright");
        self.appendElement("span", (self) => {
          self.addClassName("footer-copyright-year");
          self.appendTextNode(`© 2009–${new Date().getFullYear()}`);
        });
        self.appendElement("span", (self) => {
          self.addClassName("footer-copyright-author");
          self.appendTextNode("Ziphil");
        });
      });
    });
  });
  return self;
});

export default manager;

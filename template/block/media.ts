//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";


let manager = new AvendiaTemplateManager();

manager.registerElementRule("pdf", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("object", (self) => {
    self.addClassName("pdf");
    self.setBlockType("bordered", "bordered");
    self.setAttribute("data", element.getAttribute("src") + "#view=FitH&amp;statusbar=0&amp;toolbar=0&amp;navpanes=0&amp;messages=0");
    self.setAttribute("type", "application/pdf");
  });
  return self;
});

manager.registerElementRule("slide", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("div", (self) => {
    self.addClassName("slide");
    self.setBlockType("bordered", "bordered");
    self.appendElement("script", (self) => {
      self.addClassName("speakerdeck-embed");
      self.setAttribute("async", "async");
      self.setAttribute("data-id", element.getAttribute("code"));
      self.setAttribute("data-ratio", "1.33333333333333");
      self.setAttribute("src", "http://speakerdeck.com/assets/embed.js");
    });
  });
  return self;
});

manager.registerElementRule("youtube", "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("div", (self) => {
    self.addClassName("youtube");
    self.setBlockType("bordered", "bordered");
    self.appendElement("iframe", (self) => {
      self.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
      self.setAttribute("allowfullscreen", "allowfullscreen");
      self.setAttribute("frameborder", "0");
      self.setAttribute("src", "https://www.youtube.com/embed/" + element.getAttribute("code"));
    });
  });
  return self;
});

export default manager;
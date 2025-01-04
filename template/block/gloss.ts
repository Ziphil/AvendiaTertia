//

import {AvendiaTemplateManager} from "../../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("gloss", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("div", (self) => {
    self.addClassName("gloss");
    self.setBlockType("text", "text");
    self.appendChild(transformer.apply(element, "page.gloss"));
  });
  return self;
});

manager.registerElementRule("gloss", "page.xl.li", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("dd", (self) => {
    self.addClassName("sentence-nested-item gloss");
    self.appendChild(transformer.apply(element, "page.gloss"));
  });
  return self;
});

manager.registerElementRule("li", "page.gloss", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("gloss-word");
    self.appendChild(transformer.apply(element, "page.gloss.li"));
  });
  return self;
});

manager.registerElementRule(["sh", "bs", "ex"], "page.gloss.li", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const className = (element.tagName === "sh") ? "gloss-name" : (element.tagName === "bs") ? "gloss-base" : "gloss-explanation";
  self.appendElement("span", (self) => {
    self.addClassName(className);
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

manager.registerElementRule("mph", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("gloss-morpheme");
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

manager.registerElementRule("gls", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const space = element.hasAttribute("sp");
  self.appendElement("span", (self) => {
    self.addClassName("gloss-separator");
    if (space) {
      self.setAttribute("data-space", "");
    }
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

manager.registerElementRule("glp", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("gloss-punctuation");
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

manager.registerTextRule("page.gloss", (transformer, document, text) => {
  let content = "";
  if (text.previousSibling !== null && text.nextSibling !== null) {
    const previousSibling = text.previousSibling;
    const nextSibling = text.nextSibling;
    if (previousSibling.isElement() && previousSibling.getAttribute("punc").match(/(\(|\[|«|“)$/)) {
      content = "";
    } else if (nextSibling.isElement() && nextSibling.getAttribute("punc").match(/^(\)|\.|,|:|;|·|!|\?)/)) {
      content = "";
    } else {
      content = text.data;
    }
  } else {
    content = "";
  }
  const self = document.createTextNode(content);
  return self;
});

export default manager;
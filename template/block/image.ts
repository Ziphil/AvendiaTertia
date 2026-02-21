//

import {AvendiaTemplateManager} from "../../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("img", "page", (transformer, document, element, scope, args) => {
  const self = document.createDocumentFragment();
  self.appendElement("img", (self) => {
    self.addClassName("image");
    if (element.hasAttribute("src")) {
      self.setAttribute("src", element.getAttribute("src"));
    }
    if (element.hasAttribute("alt")) {
      self.setAttribute("alt", element.getAttribute("alt"));
    } else {
      self.setAttribute("alt", "");
    }
    if (element.hasAttribute("width")) {
      self.setAttribute("width", element.getAttribute("width"));
    }
    if (element.hasAttribute("height")) {
      self.setAttribute("height", element.getAttribute("height"));
    }
  });
  if (!args?.contained) {
    const innerSelf = self;
    const containerSelf = document.createDocumentFragment();
    containerSelf.appendElement("figure", (self) => {
      self.addClassName("figure-container");
      self.setBlockType("bordered", "bordered");
      self.appendChild(innerSelf);
    });
    return containerSelf;
  } else {
    return self;
  }
});

manager.registerElementRule("svg", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("svg", (self) => {
    self.addClassName("svg");
    if (element.hasAttribute("inline")) {
      self.setAttribute("data-inline", "");
    }
    if (element.hasAttribute("viewbox")) {
      self.setAttribute("viewBox", element.getAttribute("viewbox"));
    }
    if (element.hasAttribute("width")) {
      self.setAttribute("width", element.getAttribute("width"));
    }
    if (element.hasAttribute("height")) {
      self.setAttribute("height", element.getAttribute("height"));
    }
    self.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    self.appendChild(transformer.apply(element, "svg"));
  });
  return self;
});

manager.registerElementRule(true, "svg", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement(element.tagName, (self) => {
    for (let i = 0 ; i < element.attributes.length ; i ++) {
      const {name, value} = element.attributes.item(i)!;
      self.setAttribute(name, value);
    }
    self.appendChild(transformer.apply());
  });
  return self;
});

export default manager;
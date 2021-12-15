//

import {
  TemplateManager
} from "@zenml/zenml";
import type {
  AvendiaDocument
} from "../generator/dom";
import type {
  AvendiaTransformerEnvironments,
  AvendiaTransformerVariables
} from "../generator/transformer";


const INLINE_ELEMENT_NAMES = ["x", "xn", "a"];
let manager = new TemplateManager<AvendiaDocument, AvendiaTransformerEnvironments, AvendiaTransformerVariables>();

manager.registerElementRule(true, "page", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement(element.tagName, (self) => {
    for (let i = 0 ; i < element.attributes.length ; i ++) {
      let {name, value} = element.attributes.item(i)!;
      self.setAttribute(name, value);
    }
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule(true, true, (transformer, document) => {
  return document.createDocumentFragment();
});

manager.registerTextRule(true, (transformer, document, text) => {
  let content = text.data;
  content = content.replace(/(、|。|」|』|〉)/g, (match) => match + " ");
  content = content.replace(/(「|『|〈)/g, (match) => " " + match);
  content = content.replace(/(、|。)\s+(」|』)/g, (match, before, after) => before + after);
  content = content.replace(/(」|』|〉)\s+(、|。|,|\.)/g, (match, before, after) => before + after);
  content = content.replace(/(\(|「|『)\s+(「|『)/g, (match, before, after) => before + after);
  if (!text.previousSibling?.isElement() || !INLINE_ELEMENT_NAMES.includes(text.previousSibling.tagName)) {
    content = content.replace(/^\s+(「|『)/g, (match, paren) => paren);
  }
  if (!text.nextSibling?.isElement() || !INLINE_ELEMENT_NAMES.includes(text.nextSibling.tagName)) {
    content = content.replace(/(」|』)\s+$/g, (match, paren) => paren);
  }
  if (text.previousSibling !== null) {
    let previousSibling = text.previousSibling;
    if (previousSibling.isElement() && previousSibling.tagName === "label") {
      content = content.replace(/^\s+/g, "");
    }
  }
  let self = document.createTextNode(content);
  return self;
});

export default manager;
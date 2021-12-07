//

import {
  TemplateManager
} from "@zenml/zenml";
import type {
  AvendiaDocument
} from "../converter/dom";
import type {
  AvendiaTransformerVariables
} from "../converter/transformer";


const INLINE_ELEMENT_NAMES = ["x", "xn", "a"];
let manager = new TemplateManager<AvendiaDocument, {}, AvendiaTransformerVariables>();

manager.registerElementRule(true, "page", (transformer, document, element, scope) => {
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

manager.registerTextRule(true, (transformer, document, text) => {
  let content = text.data;
  content.replace(/(、|。|」|』|〉)/g, (match) => match + " ");
  content.replace(/(「|『|〈)/g, (match) => " " + match);
  content.replace(/(、|。)\s+(」|』)/g, (match, before, after) => before + after);
  content.replace(/(」|』|〉)\s+(、|。|,|\.)/g, (match, before, after) => before + after);
  content.replace(/(\(|「|『)\s+(「|『)/g, (match, before, after) => before + after);
  if (!text.previousSibling?.isElement() || !INLINE_ELEMENT_NAMES.includes(text.previousSibling.tagName)) {
    content.replace(/^\s+(「|『)/g, (match, paren) => paren);
  }
  if (!text.nextSibling?.isElement() || !INLINE_ELEMENT_NAMES.includes(text.nextSibling.tagName)) {
    content.replace(/(」|』)\s+$/g, (match, paren) => paren);
  }
  if (text.previousSibling !== null) {
    let previousSibling = text.previousSibling;
    if (previousSibling.isElement() && previousSibling.tagName === "label") {
      content.replace(/^\s+/g, "");
    }
  }
  return content;
});

export default manager;
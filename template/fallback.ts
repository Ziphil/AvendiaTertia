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


const INLINE_TAG_NAMES = ["x", "xn", "a"];
const PARENT_TRIM_TAG_NAMES = ["li"];
const PREVIOUS_SIBLING_TRIM_TAG_NAMES = ["label"];

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
  content = content.replace(/\uFEFF/gu, "");
  content = content.replace(/(、|。|」|』|〉)/g, (match) => match + " ");
  content = content.replace(/(「|『|〈)/g, (match) => " " + match);
  content = content.replace(/(、|。)\s+(」|』)/g, (match, before, after) => before + after);
  content = content.replace(/(」|』|〉)\s+(、|。|,|\.)/g, (match, before, after) => before + after);
  content = content.replace(/(\(|「|『)\s+(「|『)/g, (match, before, after) => before + after);
  if (!text.previousSibling?.isElement() || !INLINE_TAG_NAMES.includes(text.previousSibling.tagName)) {
    content = content.replace(/^\s+(「|『)/g, (match, paren) => paren);
  }
  if (!text.nextSibling?.isElement() || !INLINE_TAG_NAMES.includes(text.nextSibling.tagName)) {
    content = content.replace(/(」|』)\s+$/g, (match, paren) => paren);
  }
  if (text.parentNode !== null && text.parentNode.isElement()) {
    let parent = text.parentNode;
    if (PARENT_TRIM_TAG_NAMES.includes(parent.tagName) && parent.firstChild === text) {
      content = content.trimStart();
    }
  }
  if (text.previousSibling !== null && text.previousSibling.isElement()) {
    let previousSibling = text.previousSibling;
    if (PREVIOUS_SIBLING_TRIM_TAG_NAMES.includes(previousSibling.tagName)) {
      content = content.replace(/^\s+/g, "");
    }
  }
  let self = document.createTextNode(content);
  return self;
});

export default manager;
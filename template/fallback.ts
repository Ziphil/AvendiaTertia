//

import {AvendiaTemplateManager} from "../generator/transformer";


const INLINE_TAG_NAMES = ["x", "xn", "a", "ae", "an", "nw", "url"];
const PARENT_TRIM_TAG_NAMES = ["li"];
const PREVIOUS_SIBLING_TRIM_TAG_NAMES = ["label"];

const manager = new AvendiaTemplateManager();

manager.registerElementRule(true, true, (transformer, document) => {
  return document.createDocumentFragment();
});

manager.registerTextRule(true, (transformer, document, text) => {
  let content = text.data;
  content = content.replace(/\uFEFF/gu, "");
  content = content.replace(/(、|。|」|』|〉)/g, (match) => match + " ");
  content = content.replace(/(「|『|〈)/g, (match) => " " + match);
  content = content.replace(/(、|。)\s+(」|』|〉)/g, (match, before, after) => before + after);
  content = content.replace(/(」|』|〉)\s+(、|。|,|\.)/g, (match, before, after) => before + after);
  content = content.replace(/(\(|「|『|〈)\s+(「|『|〈)/g, (match, before, after) => before + after);
  if (!text.previousSibling?.isElement() || !INLINE_TAG_NAMES.includes(text.previousSibling.tagName)) {
    content = content.replace(/^\s+(「|『|〈)/g, (match, paren) => paren);
  }
  if (!text.nextSibling?.isElement() || !INLINE_TAG_NAMES.includes(text.nextSibling.tagName)) {
    content = content.replace(/(」|』|〉)\s+$/g, (match, paren) => paren);
  }
  if (text.parentNode !== null && text.parentNode.isElement()) {
    const parent = text.parentNode;
    if (PARENT_TRIM_TAG_NAMES.includes(parent.tagName) && parent.firstChild === text) {
      content = content.trimStart();
    }
  }
  if (text.previousSibling !== null && text.previousSibling.isElement()) {
    const previousSibling = text.previousSibling;
    if (PREVIOUS_SIBLING_TRIM_TAG_NAMES.includes(previousSibling.tagName)) {
      content = content.replace(/^\s+/g, "");
    }
  }
  const self = document.createTextNode(content);
  return self;
});

export default manager;
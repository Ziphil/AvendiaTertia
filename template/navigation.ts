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


let manager = new TemplateManager<AvendiaDocument, {}, AvendiaTransformerVariables>();

manager.registerElementRule("ver", "navigation", (transformer, document, element) => {
  let self = document.createDocumentFragment();
  self.appendElement("div", (self) => {
    let content = element.textContent;
    if (content === "*" || content?.match(/(5\s*代\s*5\s*期|S\s*代|Version\s*5\.5|Version\s*S)/)) {
      self.addClassName("version");
      transformer.variables.latest = true;
    } else {
      self.addClassName("version caution");
    }
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

manager.registerElementRule(true, "navigation", () => {
  return "";
});

manager.registerTextRule("navigation", () => {
  return "";
});

export default manager;
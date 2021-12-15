//

import {
  SimpleZenmlPlugin,
  ZenmlPluginManager
} from "@zenml/zenml";
import {
  ZoticaZenmlPlugin
} from "@zenml/zotica";


let manager = new ZenmlPluginManager();

manager.registerPlugin("m", new ZoticaZenmlPlugin((builder, tagName, marks, attributes, childrenArgs) => {
  let self = builder.createDocumentFragment();
  builder.appendElement(self, "math-inline", (self) => {
    for (let child of childrenArgs[0] ?? []) {
      builder.appendChild(self, child);
    }
  });
  return [self];
}));

manager.registerPlugin("mb", new ZoticaZenmlPlugin((builder, tagName, marks, attributes, childrenArgs) => {
  let self = builder.createDocumentFragment();
  builder.appendElement(self, "math-block", (self) => {
    if (attributes.has("id")) {
      self.setAttribute("id", attributes.get("id")!);
    }
    for (let child of childrenArgs[0] ?? []) {
      builder.appendChild(self, child);
    }
  });
  return [self];
}));

manager.registerPlugin("mark", new SimpleZenmlPlugin((builder, tagName, marks, attributes, childrenArgs) => {
  let nodes = childrenArgs[0] ?? [];
  return nodes;
}));

manager.registerPlugin("raw", new SimpleZenmlPlugin((builder, tagName, marks, attributes, childrenArgs) => {
  let nodes = childrenArgs[0] ?? [];
  return nodes;
}));

export default manager;
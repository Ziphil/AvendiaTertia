//

import {
  SimpleZenmlPlugin,
  ZenmlPluginManager
} from "@zenml/zenml";
import {
  ZoticaZenmlPlugin
} from "@zenml/zotica";


const manager = new ZenmlPluginManager();

manager.registerPlugin("m", new ZoticaZenmlPlugin((builder, tagName, marks, attributes, childrenArgs) => {
  const self = builder.createDocumentFragment();
  builder.appendElement(self, "math-inline", (self) => {
    for (const child of childrenArgs[0] ?? []) {
      builder.appendChild(self, child);
    }
  });
  return [self];
}));

manager.registerPlugin("mb", new ZoticaZenmlPlugin((builder, tagName, marks, attributes, childrenArgs) => {
  const self = builder.createDocumentFragment();
  builder.appendElement(self, "math-block", (self) => {
    if (attributes.has("id")) {
      self.setAttribute("id", attributes.get("id")!);
    }
    for (const child of childrenArgs[0] ?? []) {
      builder.appendChild(self, child);
    }
  });
  return [self];
}));

manager.registerPlugin("mark", new ZoticaZenmlPlugin((builder, tagName, marks, attributes, childrenArgs) => {
  const self = builder.createDocumentFragment();
  builder.appendElement(self, "math-mark", (self) => {
    for (const child of childrenArgs[0] ?? []) {
      builder.appendChild(self, child);
    }
  });
  return [self];
}));

manager.registerPlugin("raw", new SimpleZenmlPlugin((builder, tagName, marks, attributes, childrenArgs) => {
  const nodes = childrenArgs[0] ?? [];
  return nodes;
}));

export default manager;
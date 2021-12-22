//

import {
  SimpleZenmlPlugin,
  ZenmlPluginManager
} from "@zenml/zenml";


let manager = new ZenmlPluginManager();

manager.registerPlugin("ch", new SimpleZenmlPlugin((builder, tagName, marks, attributes, childrenArgs) => {
  let self = builder.createDocumentFragment();
  if (attributes.has("c")) {
    let codePoint = parseInt(attributes.get("c")!, 16);
    builder.appendTextNode(self, String.fromCodePoint(codePoint));
  } else if (attributes.has("n")) {
    let query = attributes.get("n")!;
    if (query === "nbsp") {
      builder.appendTextNode(self, String.fromCodePoint(0xA0));
    }
  }
  return [self];
}));

export default manager;
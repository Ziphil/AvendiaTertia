//

import {
  SimpleZenmlPlugin,
  ZenmlPluginManager
} from "@zenml/zenml";
import CONJUGATIONS from "~/plugin/conjugations.json";


let manager = new ZenmlPluginManager();

manager.registerPlugin("lig", new SimpleZenmlPlugin((builder, tagName, marks, attributes, childrenArgs) => {
  let self = builder.createDocumentFragment();
  let version = attributes.get("ver") || "seven";
  let children = childrenArgs[0] ?? [];
  builder.appendElement(self, "li", (self) => {
    for (let child of children) {
      self.appendChild(child.cloneNode(true));
    }
    if (attributes.has("auto")) {
      let nameQuery = attributes.get("auto")!;
      for (let [code, [name, kind]] of Object.entries(CONJUGATIONS[version].fixed)) {
        if (nameQuery === code) {
          builder.appendElement(self, "sh", (self) => {
            builder.appendElement(self, "x", (self) => {
              builder.appendTextNode(self, name);
            });
          });
          builder.appendElement(self, "ex", (self) => {
            builder.appendElement(self, "mph", (self) => {
              builder.appendTextNode(self, kind["ja"]);
            });
          });
        }
      }
    }
    if (attributes.has("punc")) {
      let punctuation = attributes.get("punc")!;
      self.setAttribute("punc", punctuation);
      builder.appendElement(self, "sh", (self) => {
        builder.appendElement(self, "xn", (self) => {
          builder.appendTextNode(self, punctuation);
        });
      });
    }
    if (attributes.has("conj")) {
      for (let i = 0 ; i < self.childNodes.length ; i ++) {
        let child = self.childNodes.item(i)!;
        if (child.isElement()) {
          let conjugationQuery = attributes.get("conj")!;
          let [prefixQuery, suffixQuery] = conjugationQuery.split("-", 2);
          let prefixResults = [] as Array<Array<Node>>;
          let suffixResults = [] as Array<Array<Node>>;
          for (let [code, [prefix, kind]] of Object.entries(CONJUGATIONS[version].prefix)) {
            let index = prefixQuery.indexOf(code);
            if (index >= 0) {
              if (child.tagName === "sh") {
                let prefixElement = builder.createElement("xn", (self) => {
                  builder.appendTextNode(self, prefix);
                });
                let prefixText = builder.createTextNode("-");
                prefixResults[index] = [prefixElement, prefixText];
              } else if (child.tagName === "ex") {
                let prefixText = builder.createTextNode(kind["ja"] + "-");
                prefixResults[index] = [prefixText];
              }
            }
          }
          for (let [code, [prefix, kind]] of Object.entries(CONJUGATIONS[version].suffix)) {
            let index = suffixQuery.indexOf(code);
            if (index >= 0) {
              if (child.tagName === "sh") {
                let suffixElement = builder.createElement("xn", (self) => {
                  builder.appendTextNode(self, prefix);
                });
                let suffixText = builder.createTextNode("-");
                suffixResults[index] = [suffixText, suffixElement];
              } else if (child.tagName === "ex") {
                let suffixText = builder.createTextNode("-" + kind["ja"]);
                suffixResults[index] = [suffixText];
              }
            }
          }
          let prefixFragment = builder.createDocumentFragment((self) => {
            for (let prefixNode of prefixResults.flat()) {
              builder.appendChild(self, prefixNode);
            }
          });
          let suffixFragment = builder.createDocumentFragment((self) => {
            for (let suffixNode of suffixResults.flat()) {
              builder.appendChild(self, suffixNode);
            }
          });
          if (child.tagName === "sh") {
            child.insertFirst(prefixFragment);
            child.insertLast(suffixFragment);
          } else if (child.tagName === "ex") {
            let prefixMorphemeElement = builder.createElement("mph", (self) => {
              builder.appendChild(self, prefixFragment);
            });
            let suffixMorphemeElement = builder.createElement("mph", (self) => {
              builder.appendChild(self, suffixFragment);
            });
            child.insertFirst(prefixMorphemeElement);
            child.insertLast(suffixMorphemeElement);
          }
        }
      }
    }
  });
  return [self];
}));

export default manager;
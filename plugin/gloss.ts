//

import {
  Builder,
  SimpleZenmlPlugin,
  ZenmlPluginManager
} from "@zenml/zenml";
import CONJUGATIONS from "~/plugin/conjugations.json";


const manager = new ZenmlPluginManager();

function createMorphemeElement(builder: Builder, kinds: Array<[string, string]>): DocumentFragment {
  const element = builder.createDocumentFragment((self) => {
    for (let i = 0 ; i < kinds.length ; i ++) {
      const [abbreviation, full] = kinds[i];
      if (i > 0) {
        builder.appendTextNode(self, ".");
      }
      builder.appendElement(self, "abbr", (self) => {
        self.setAttribute("full", full);
        builder.appendTextNode(self, abbreviation);
      });
    }
  });
  return element;
}

manager.registerPlugin("lig", new SimpleZenmlPlugin((builder, tagName, marks, attributes, childrenArgs) => {
  const self = builder.createDocumentFragment();
  const version = attributes.get("ver") || "seven";
  const children = childrenArgs[0] ?? [];
  builder.appendElement(self, "li", (self) => {
    for (const child of children) {
      self.appendChild(child.cloneNode(true));
    }
    if (attributes.has("auto")) {
      const nameQuery = attributes.get("auto")!;
      for (const [code, [name, kinds]] of Object.entries(CONJUGATIONS[version].fixed)) {
        if (nameQuery === code) {
          builder.appendElement(self, "sh", (self) => {
            builder.appendElement(self, "x", (self) => {
              builder.appendTextNode(self, name);
            });
          });
          builder.appendElement(self, "ex", (self) => {
            builder.appendElement(self, "mph", (self) => {
              self.appendChild(createMorphemeElement(builder, kinds["ja"]));
            });
          });
        }
      }
    }
    if (attributes.has("punc")) {
      const punctuation = attributes.get("punc")!;
      self.setAttribute("punc", punctuation);
      builder.appendElement(self, "sh", (self) => {
        builder.appendElement(self, "xn", (self) => {
          builder.appendTextNode(self, punctuation);
        });
      });
    }
    if (attributes.has("conj")) {
      for (let i = 0 ; i < self.childNodes.length ; i ++) {
        const child = self.childNodes.item(i)!;
        if (child.isElement()) {
          const conjugationQuery = attributes.get("conj")!;
          const [prefixQuery, suffixQuery] = conjugationQuery.split("-", 2);
          const prefixResults = [] as Array<Array<Node>>;
          const suffixResults = [] as Array<Array<Node>>;
          for (const [code, [prefix, kinds]] of Object.entries(CONJUGATIONS[version].prefix)) {
            const index = prefixQuery.indexOf(code);
            if (index >= 0) {
              if (child.tagName === "sh") {
                const prefixElement = builder.createElement("xn", (self) => {
                  builder.appendTextNode(self, prefix);
                });
                const prefixPunctuationElement = builder.createElement("glp", (self) => {
                  builder.appendTextNode(self, "-");
                });
                prefixResults[index] = [prefixElement, prefixPunctuationElement];
              } else if (child.tagName === "ex") {
                const prefixMorphemeElement = createMorphemeElement(builder, kinds["ja"]);
                const prefixPunctuationElement = builder.createElement("glp", (self) => {
                  builder.appendTextNode(self, "-");
                });
                prefixResults[index] = [prefixMorphemeElement, prefixPunctuationElement];
              }
            }
          }
          for (const [code, [prefix, kinds]] of Object.entries(CONJUGATIONS[version].suffix)) {
            const index = suffixQuery.indexOf(code);
            if (index >= 0) {
              if (child.tagName === "sh") {
                const suffixElement = builder.createElement("xn", (self) => {
                  builder.appendTextNode(self, prefix);
                });
                const suffixPunctuationElement = builder.createElement("glp", (self) => {
                  builder.appendTextNode(self, "-");
                });
                suffixResults[index] = [suffixPunctuationElement, suffixElement];
              } else if (child.tagName === "ex") {
                const suffixPunctuationElement = builder.createElement("glp", (self) => {
                  builder.appendTextNode(self, "-");
                });
                const suffixMorphemeText = createMorphemeElement(builder, kinds["ja"]);
                suffixResults[index] = [suffixPunctuationElement, suffixMorphemeText];
              }
            }
          }
          const prefixFragment = builder.createDocumentFragment((self) => {
            for (const prefixNode of prefixResults.flat()) {
              builder.appendChild(self, prefixNode);
            }
          });
          const suffixFragment = builder.createDocumentFragment((self) => {
            for (const suffixNode of suffixResults.flat()) {
              builder.appendChild(self, suffixNode);
            }
          });
          if (child.tagName === "sh") {
            child.insertFirst(prefixFragment);
            child.insertLast(suffixFragment);
          } else if (child.tagName === "ex") {
            const prefixMorphemeElement = builder.createElement("mph", (self) => {
              builder.appendChild(self, prefixFragment);
            });
            const suffixMorphemeElement = builder.createElement("mph", (self) => {
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
//

import {AvendiaTemplateManager} from "../../generator/transformer";


const manager = new AvendiaTemplateManager();

function splitToWords(string: string): Array<string> {
  const splitStrings = ["", ...string.split(/('| )/), ""];
  for (let i = 0 ; i < splitStrings.length ; i ++) {
    if (i % 2 === 0) {
      if (splitStrings[i] === "'") {
        const previous = splitStrings[i - 1];
        if (previous === "s" || previous === "di" || previous === "ac" || previous === "al") {
          splitStrings[i - 1] = splitStrings[i - 1] + "'";
        } else {
          splitStrings[i + 1] = "'" + splitStrings[i + 1];
        }
        splitStrings[i] = "";
      }
    } else {
      let match;
      if ((match = splitStrings[i].match(/^((?:\(|\[|«|“)+)(.*?)$/)) !== null) {
        splitStrings[i - 1] = splitStrings[i - 1] + match[1];
        splitStrings[i] = match[2];
      }
      if ((match = splitStrings[i].match(/^(.*?)((?:\)|\]|»|”|\.|,|:|;|!|\?)+)$/)) !== null) {
        splitStrings[i + 1] = match[2] + splitStrings[i + 1];
        splitStrings[i] = match[1];
      }
    }
  }
  return splitStrings;
};

manager.registerElementRule("x", true, (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("sans");
    if (true) {
      let currentNode = document.createDocumentFragment();
      let currentName = "";
      const appendCurrentNode = function () {
        self.appendElement("span", (self) => {
          self.addClassName("word");
          self.setAttribute("data-name", currentName);
          self.appendChild(currentNode);
        });
        currentNode = document.createDocumentFragment();
        currentName = "";
      };
      for (let i = 0 ; i < element.childNodes.length ; i ++) {
        const child = element.childNodes.item(i)!;
        if (child.isText()) {
          const splitContents = splitToWords(child.data);
          for (let j = 0 ; j < splitContents.length ; j ++) {
            const content = splitContents[j];
            if (j % 2 === 1) {
              currentNode.appendChild(document.createTextNode(content));
              currentName += content;
              if (j < splitContents.length - 2 || splitContents[j + 1] !== "") {
                appendCurrentNode();
              }
            } else {
              self.appendTextNode(content);
            }
          }
        } else if (child.isElement()) {
          currentNode.appendChild(transformer.processElement(child));
          currentName += child.textContent;
        }
      }
      appendCurrentNode();
    } else {
      self.appendChild(transformer.apply());
    }
  });
  return self;
});

manager.registerElementRule("xn", true, (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("sans");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("i", true, (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("var", (self) => {
    self.addClassName("italic");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("sc", true, (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("smallcaps");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule(["sup", "sub"], true, (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName(element.tagName);
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("k", true, (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("japanese");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule(["c", "m"], ["page", "page.section-table"], (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const className = (element.tagName === "c") ? "code" : "monospace";
  self.appendElement("code", (self) => {
    self.addClassName(className);
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("nw", true, (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("nowrap");
    self.appendChild(transformer.apply());
  });
  return self;
});

manager.registerElementRule("url", true, (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("url");
    self.appendChild(transformer.apply());
  });
  return self;
});

export default manager;
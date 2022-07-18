//

import {
  AvendiaTemplateManager
} from "../../generator/transformer";


const manager = new AvendiaTemplateManager();

manager.registerElementRule("ql", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("dl", (self) => {
    self.addClassName("quiz-list");
    self.setBlockType("bordered", "bordered");
    self.appendChild(transformer.apply(element, "page.ql"));
  });
  return self;
});

manager.registerElementRule("li", "page.ql", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  const answerElement = element.searchXpath("choice/li[@ans]")[0] as Element;
  const answerNumber = (answerElement.searchXpath("preceding-sibling::li").length + 1).toString();
  self.appendChild(transformer.apply(element, "page.ql.li"));
  self.appendChild(document.createElement("dd", (self) => {
    self.addClassName("quiz-nested-item quiz-answer-item");
    self.setAttribute("data-unmarked", "");
    self.appendElement("span", (self) => {
      self.addClassName("quiz-masked");
      self.appendElement("span", (self) => {
        self.addClassName("box");
        self.appendTextNode(answerNumber);
      });
      self.appendChild(transformer.apply(answerElement, "page"));
    });
  }));
  return self;
});

manager.registerElementRule("sh", "page.ql.li", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("dt", (self) => {
    self.addClassName("quiz-item");
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

manager.registerElementRule("ja", "page.ql.li", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("dd", (self) => {
    self.addClassName("quiz-nested-item");
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

manager.registerElementRule("blank", "page", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("span", (self) => {
    self.addClassName("quiz-blank");
  });
  return self;
});

manager.registerElementRule("choice", "page.ql.li", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("dd", (self) => {
    self.addClassName("quiz-nested-item");
    self.setAttribute("data-unmarked", "");
    self.appendElement("ol", (self) => {
      self.addClassName("quiz-choice-list");
      self.appendChild(transformer.apply(element, "page.ql.li.choice"));
    });
  });
  return self;
});

manager.registerElementRule("li", "page.ql.li.choice", (transformer, document, element) => {
  const self = document.createDocumentFragment();
  self.appendElement("li", (self) => {
    self.addClassName("quiz-choice-item");
    self.appendChild(transformer.apply(element, "page"));
  });
  return self;
});

export default manager;
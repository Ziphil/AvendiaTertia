//

import {
  BaseDocument,
  BaseDocumentFragment,
  BaseElement,
  BaseElementOptions,
  BaseText,
  BaseTextOptions,
  NodeCallback,
  NodeLikeOf
} from "@zenml/zenml";


export class AvendiaElement extends BaseElement<AvendiaDocument, AvendiaDocumentFragment, AvendiaElement, AvendiaText> {

  public addClassName(className: string): void {
    let currentClassName = this.attributes.get("class");
    let nextClassName = (currentClassName) ? currentClassName + " " + className : className;
    this.attributes.set("class", nextClassName);
  }

  public setBlockType(topBlockType: string, bottomBlockType: string): void {
    this.addClassName("block");
    this.setAttribute("data-top-block-type", topBlockType);
    this.setAttribute("data-bottom-block-type", bottomBlockType);
  }

  public insertHead<N extends AvendiaElement | AvendiaText>(child: N): N {
    return this.fragment.insertHead(child);
  }

  public insertElementHead(tagName: string, callback?: NodeCallback<AvendiaElement>): AvendiaElement {
    return this.fragment.insertElementHead(tagName, callback);
  }

}


export class AvendiaDocument extends BaseDocument<AvendiaDocument, AvendiaDocumentFragment, AvendiaElement, AvendiaText> {

  public createBreadcrumb(callback?: (self: AvendiaElement) => void): NodeLikeOf<AvendiaDocument> {
    let self = this.createDocumentFragment();
    self.appendElement("ul", (self) => {
      self.setAttribute("itemscope", "itemscope");
      self.setAttribute("itemtype", "https://schema.org/BreadcrumbList");
      callback?.call(this, self);
    });
    return self;
  }

  public createBreadcrumbItem(level: number, callback?: (itemSelf: AvendiaElement, linkSelf: AvendiaElement, nameSelf: AvendiaElement) => void): NodeLikeOf<AvendiaDocument> {
    let self = this.createDocumentFragment();
    self.appendElement("li", (itemSelf) => {
      itemSelf.setAttribute("itemscope", "itemscope");
      itemSelf.setAttribute("itemprop", "itemListElement");
      itemSelf.setAttribute("itemtype", "https://schema.org/ListItem");
      itemSelf.appendElement("a", (linkSelf) => {
        linkSelf.setAttribute("itemprop", "item");
        linkSelf.setAttribute("itemtype", "https://schema.org/Thing");
        linkSelf.appendElement("span", (nameSelf) => {
          nameSelf.setAttribute("itemprop", "name");
          callback?.call(this, itemSelf, linkSelf, nameSelf);
        });
      });
      itemSelf.appendElement("meta", (self) => {
        self.setAttribute("itemprop", "position");
        self.setAttribute("content", level.toString());
      });
    });
    return self;
  }

  public placeholder(): AvendiaElement {
    return this.createElement("");
  }

  public createDocumentFragment(): AvendiaDocumentFragment {
    return new AvendiaDocumentFragment(this);
  }

  public createElement(tagName: string, options?: BaseElementOptions): AvendiaElement {
    return new AvendiaElement(this, tagName);
  }

  public createTextNode(content: string, options?: BaseTextOptions): AvendiaText {
    return new AvendiaText(this, content, options);
  }

}


export class AvendiaDocumentFragment extends BaseDocumentFragment<AvendiaDocument, AvendiaDocumentFragment, AvendiaElement, AvendiaText> {

  public insertHead<N extends AvendiaElement | AvendiaText>(child: N): N {
    let firstSpace = "";
    for (let node of this.nodes) {
      if (node instanceof BaseText) {
        let match;
        if ((match = node.content.match(/^\s*$/)) !== null) {
          firstSpace += match[0];
          node.content = "";
        } else if ((match = node.content.match(/^\s+/)) !== null) {
          firstSpace += match[0];
          node.content = node.content.replace(/^\s+/, "");
          break;
        }
      } else {
        break;
      }
    }
    this.nodes.unshift(child);
    if (firstSpace !== "") {
      this.nodes.unshift(this.document.createTextNode(firstSpace));
    }
    return child;
  }

  public insertElementHead(tagName: string, callback?: NodeCallback<AvendiaElement>): AvendiaElement {
    let element = this.document.createElement(tagName);
    callback?.call(this, element);
    this.insertHead(element);
    return element;
  }

}


export class AvendiaText extends BaseText<AvendiaDocument, AvendiaDocumentFragment, AvendiaElement, AvendiaText> {

}
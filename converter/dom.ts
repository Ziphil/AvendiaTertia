//

import {
  BaseDocument,
  BaseDocumentFragment,
  BaseElement,
  NodeLikeOf
} from "@zenml/zenml";


export class AvendiaElement extends BaseElement<AvendiaDocument, AvendiaDocumentFragment, AvendiaElement> {

  public addClassName(className: string): void {
    let currentClassName = this.attributes.get("class");
    let nextClassName = (currentClassName) ? currentClassName + " " + className : className;
    this.attributes.set("class", nextClassName);
  }

}


export class AvendiaDocument extends BaseDocument<AvendiaDocument, AvendiaDocumentFragment, AvendiaElement> {

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

  public createDocumentFragment(): AvendiaDocumentFragment {
    return new AvendiaDocumentFragment(this);
  }

  public createElement(tagName: string): AvendiaElement {
    return new AvendiaElement(this, tagName);
  }

}


export class AvendiaDocumentFragment extends BaseDocumentFragment<AvendiaDocument, AvendiaDocumentFragment, AvendiaElement> {

}
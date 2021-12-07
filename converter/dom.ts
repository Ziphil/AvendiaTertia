//

import {
  BaseDocument,
  BaseDocumentFragment,
  BaseElement
} from "@zenml/zenml";


export class AvendiaElement extends BaseElement<AvendiaDocument, AvendiaDocumentFragment, AvendiaElement> {

  public addClassName(className: string): void {
    let currentClassName = this.attributes.get("class");
    let nextClassName = (currentClassName) ? currentClassName + " " + className : className;
    this.attributes.set("class", nextClassName);
  }

}


export class AvendiaDocument extends BaseDocument<AvendiaDocument, AvendiaDocumentFragment, AvendiaElement> {

  public createDocumentFragment(): AvendiaDocumentFragment {
    return new AvendiaDocumentFragment(this);
  }

  public createElement(tagName: string): AvendiaElement {
    return new AvendiaElement(this, tagName);
  }

}


export class AvendiaDocumentFragment extends BaseDocumentFragment<AvendiaDocument, AvendiaDocumentFragment, AvendiaElement> {

}
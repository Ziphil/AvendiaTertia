//

import {
  BaseDocument,
  BaseDocumentFragment,
  BaseElement
} from "@zenml/zenml";


export class AvendiaElement extends BaseElement<AvendiaDocument, AvendiaDocumentFragment, AvendiaElement> {

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
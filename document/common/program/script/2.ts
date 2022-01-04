/// <reference path="../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {
  BaseExecutor
} from "./module/executor";


export class Executor extends BaseExecutor {

  protected prepare(): void {
    let element = document.querySelector<HTMLInputElement>("[name=\"search\"]")!;
    let checkbox = document.querySelector<HTMLInputElement>("#checkbox-conversion-0")!;
    element.addEventListener("keyup", (event) => {
      if (checkbox.checked) {
        let text = element.value;
        let nextText = this.convert(text);
        if (text !== nextText) {
          element.value = nextText;
        }
      }
    });
    element.focus();
  }

  private convert(text: string): string {
    let nextText = text;
    nextText = nextText.replace(/aa/g, "â");
    nextText = nextText.replace(/ee/g, "ê");
    nextText = nextText.replace(/ii/g, "î");
    nextText = nextText.replace(/oo/g, "ô");
    nextText = nextText.replace(/uu/g, "û");
    nextText = nextText.replace(/ai/g, "á");
    nextText = nextText.replace(/ei/g, "é");
    nextText = nextText.replace(/ie/g, "í");
    nextText = nextText.replace(/au/g, "à");
    nextText = nextText.replace(/eu/g, "è");
    nextText = nextText.replace(/iu/g, "ì");
    nextText = nextText.replace(/oa/g, "ò");
    nextText = nextText.replace(/ua/g, "ù");
    return nextText;
  }

}


Executor.regsiter();
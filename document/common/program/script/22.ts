/// <reference path="../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {BaseExecutor} from "./module/executor";


export class Executor extends BaseExecutor {

  protected prepare(): void {
    const elements = this.getAnimatedElements();
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.triggerAnimation(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        }
      }, {rootMargin: "0px 0px -10% 0px"});
      for (const element of elements) {
        observer.observe(element);
      }
    } else {
      for (const element of elements) {
        this.triggerAnimation(element);
      }
    }
  }

  private getAnimatedElements(): NodeListOf<HTMLElement> {
    return document.querySelectorAll<HTMLElement>("[data-fade=\"before\"]");
  }

  private triggerAnimation(element: HTMLElement): void {
    element.dataset["fade"] = "after";
  }

}


Executor.register("load");

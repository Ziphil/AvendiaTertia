/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>


export abstract class BaseExecutor {

  protected abstract prepare(): void;

  public static regsiter<E extends BaseExecutor>(this: new() => E, type: ExecutorType = "load"): void {
    let executor = new this();
    if (type === "load") {
      window.addEventListener("load", () => {
        executor.prepare();
      });
    } else if (type === "contentLoad") {
      window.addEventListener("DOMContentLoaded", () => {
        executor.prepare();
      });
    } else {
      executor.prepare();
    }
  }

  public static addLoadListener(listener: (event: Event) => unknown): void {
    window.addEventListener("load", listener);
  }

}


type ExecutorType = "load" | "contentLoad" | "direct";
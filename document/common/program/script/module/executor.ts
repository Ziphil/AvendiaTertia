/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>


export abstract class BaseExecutor {

  protected abstract prepare(): void;

  public static regsiter<E extends BaseExecutor>(this: new() => E): void {
    let executor = new this();
    window.addEventListener("load", () => {
      executor.prepare();
    });
  }

  public static addLoadListener(listener: (event: Event) => unknown): void {
    window.addEventListener("load", listener);
  }

}
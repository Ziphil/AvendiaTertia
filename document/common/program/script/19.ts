/// <reference path="../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {
  Howl
} from "howler";
import {
  BaseExecutor
} from "./module/executor";


export class Executor extends BaseExecutor {

  private playingHowl: Howl | null = null;

  protected prepare(): void {
    const elements = this.getSongElements();
    for (const element of elements) {
      const number = element.dataset.number ?? "";
      element.addEventListener("click", () => {
        const state = element.dataset.state ?? "";
        if (state === "playing") {
          this.pause(number);
        } else if (state === "pausing") {
          this.resume(number);
        } else {
          this.play(number);
        }
      });
    }
  }

  private play(number: string): void {
    const oldHowl = this.playingHowl;
    const howl = new Howl({src: [`/file/song/${number}.mp3`]});
    oldHowl?.pause();
    howl.play();
    howl.on("end", () => {
      this.playingHowl = null;
      this.unmarkState();
    });
    this.markStatePlaying(number);
    this.playingHowl = howl;
  }

  private pause(number: string): void {
    const howl = this.playingHowl;
    this.markStatePausing(number);
    howl?.pause();
  }

  private resume(number: string): void {
    const howl = this.playingHowl;
    this.markStatePlaying(number);
    howl?.play();
  }

  private markStatePlaying(number: string): void {
    const element = this.getSongElement(number);
    if (element) {
      this.unmarkState();
      element.setAttribute("data-state", "playing");
    }
  }

  private markStatePausing(number: string): void {
    const element = this.getSongElement(number);
    if (element) {
      this.unmarkState();
      element.setAttribute("data-state", "pausing");
    }
  }

  private unmarkState(): void {
    const elements = this.getActiveSongElements();
    for (const element of elements) {
      element.removeAttribute("data-state");
    }
  }

  private getSongElement(number: string): HTMLButtonElement | null {
    const element = document.querySelector<HTMLButtonElement>(`.song-item[data-number="${number}"]`);
    return element;
  }

  private getSongElements(): Array<HTMLButtonElement> {
    const elements = document.querySelectorAll<HTMLButtonElement>(`.song-item`);
    return [...elements];
  }

  private getActiveSongElements(): Array<HTMLButtonElement> {
    const elements = document.querySelectorAll<HTMLButtonElement>(`.song-item[data-state]`);
    return [...elements];
  }

}


Executor.regsiter("load");
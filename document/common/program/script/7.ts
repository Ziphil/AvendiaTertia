/// <reference path="../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {
  BaseExecutor
} from "./module/executor";


const DIGIT_SIZE = 3;
const RATING_WEIGHT = 0.9;
const CORRECTION_WEIGHT = 0.9;
const SCALING_CONSTANT = 100;
const MAX_CORRECTION = 90;
const MAX_CORRECTION_RATE = 0.8;

const OVERALL_MIN_RATING = 0;
const OVERALL_MAX_RATING = 300;

const OVERALL_MIN_DATE = new Date(1970, 0, 1);
const OVERALL_MAX_DATE = new Date(2099, 11, 31);

const CHART_WIDTH = 605;
const CHART_HEIGHT = 400;
const CHART_OFFSET_LEFT = 35;
const CHART_OFFSET_TOP = 50;
const CHART_MARGIN = 40;
const CHART_BORDER_RADIUS = 10;
const POPUP_DISTANCE = 100;

const MARKER_SIZE = 3;
const MARKER_BORDER_WIDTH = 1;
const LARGE_MARKER_SIZE = 6;

const CHART_LINE_WIDTH = 2;
const CHART_GAP_WIDTH = 2;

const PARTICLE_LIFE = 500;
const PARTICLE_MAX_RADIUS = 15;
const PARTICLE_LINE_WIDTH = 2;

const COLOR_SIZE = 8;
const COLOR_SPAN = 30;
const COLOR_NAMES = ["grey", "brown", "green", "cyan", "blue", "yellow", "orange", "red"];

const TWITTER_WIDTH = 560;
const TWITTER_HEIGHT = 320;
const TWITTER_MESSAGE = "My weblio vocabulary rating is now %r (%c)!";
const TWITTER_HASHTAG = "WeblioRating";

const INTERVAL = 50;
const COOKIE_AGE = 10000;

const INTERFACE_URL = "../../program/interface/2.cgi";

type HistoryMode = 0 | 1;
type Coordinates = {x: number, y: number};


export interface Parameter {

  input: string | undefined;
  number: string | null;
  mode: number;

}


export class HistoryEntry {

  public date: Date;
  public score: number;
  public rating: number;
  public x: number;
  public y: number;
  public firstIndex: number;

  public constructor(date: Date, score: number, firstIndex: number) {
    this.date = date;
    this.score = score;
    this.rating = 0;
    this.x = 0;
    this.y = 0;
    this.firstIndex = firstIndex;
  }

}


export class History {

  public entries: Array<HistoryEntry>;
  private minRating: number;
  private maxRating: number;
  private minDate: Date;
  private maxDate: Date;
  public mode: HistoryMode;

  public constructor() {
    this.entries = [];
    this.minRating = OVERALL_MAX_RATING;
    this.maxRating = OVERALL_MAX_RATING;
    this.minDate = OVERALL_MIN_DATE;
    this.maxDate = OVERALL_MAX_DATE;
    this.mode = 0;
  }

  public update(text: string, mode: HistoryMode): void {
    const splitText = text.split(/\r\n|\r|\n/);
    this.entries = [];
    this.mode = mode;
    for (let i = 0 ; i < splitText.length ; i ++) {
      const line = splitText[i];
      const match = line.match(/^\s*(\d+)\/(\d+)\/(\d+)\s*,\s*(\d+(?:\.\d+)?)\s*$/m);
      if (match !== null) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]);
        const day = parseInt(match[3]);
        const score = parseFloat(match[4]);
        const date = new Date(year, month - 1, day);
        const trimedScore = Math.min(Math.max(score, OVERALL_MIN_RATING), OVERALL_MAX_RATING);
        const entry = new HistoryEntry(date, trimedScore, i);
        this.entries.push(entry);
      }
    }
    this.entries.sort((first, second) => {
      if (first.date < second.date) {
        return -1;
      } else if (first.date > second.date) {
        return 1;
      } else {
        return first.firstIndex - second.firstIndex;
      }
    });
    this.calculateRating();
    this.calculateMinMaxRating();
    this.calculateMinMaxDate();
    this.calculateCoordinates();
  }

  private calculateRating(): void {
    const entries = this.entries;
    for (let i = 0 ; i < entries.length ; i ++) {
      let num = 0;
      let denom = 0;
      for (let j = i ; j >= 0 ; j --) {
        num += History.scaling(entries[j].score) * (RATING_WEIGHT ** (i - j));
        denom += RATING_WEIGHT ** (i - j);
      }
      const rawRating = History.inverseScaling(num / denom);
      let rating = rawRating - History.correction(i, rawRating);
      rating = Math.min(Math.max(rating, OVERALL_MIN_RATING), OVERALL_MAX_RATING);
      entries[i].rating = rating;
    }
  }

  private calculateMinMaxRating(): void {
    let minRating = OVERALL_MAX_RATING;
    let maxRating = OVERALL_MIN_RATING;
    for (const entry of this.entries) {
      if (entry.rating > maxRating) {
        maxRating = entry.rating;
      }
      if (entry.rating < minRating) {
        minRating = entry.rating;
      }
    }
    this.minRating = Math.max(minRating - 10, OVERALL_MIN_RATING);
    this.maxRating = Math.min(maxRating + 10, OVERALL_MAX_RATING);
  }

  private calculateMinMaxDate(): void {
    let minDate = OVERALL_MAX_DATE;
    let maxDate = OVERALL_MIN_DATE;
    for (const entry of this.entries) {
      if (entry.date > maxDate) {
        maxDate = entry.date;
      }
      if (entry.date < minDate) {
        minDate = entry.date;
      }
    }
    this.minDate = minDate;
    this.maxDate = maxDate;
  }

  private calculateCoordinates(): void {
    const entries = this.entries;
    for (let i = 0 ; i < entries.length ; i ++) {
      const rating = entries[i].rating;
      entries[i].x = this.x(i);
      entries[i].y = this.y(rating);
    }
  }

  public x(index: number): number {
    const entries = this.entries;
    if (this.mode === 0) {
      const length = entries.length;
      if (length > 1) {
        return (CHART_WIDTH - CHART_MARGIN * 2) / (length - 1) * index + CHART_MARGIN + CHART_OFFSET_LEFT;
      } else {
        return CHART_WIDTH / 2 + CHART_OFFSET_LEFT;
      }
    } else {
      const length = Math.floor((this.maxDate.getTime() - this.minDate.getTime()) / (1000 * 60 * 60 * 24));
      const elapsedDay = Math.floor((entries[index].date.getTime() - this.minDate.getTime()) / (1000 * 60 * 60 * 24));
      if (length > 0) {
        return (CHART_WIDTH - CHART_MARGIN * 2) / length * elapsedDay + CHART_MARGIN + CHART_OFFSET_LEFT;
      } else {
        return CHART_WIDTH / 2 + CHART_OFFSET_LEFT;
      }
    }
  }

  public y(value: number): number {
    return CHART_HEIGHT - (value - this.minRating) / (this.maxRating - this.minRating) * CHART_HEIGHT + CHART_OFFSET_TOP;
  }

  private static scaling(value: number): number {
    if (SCALING_CONSTANT > 0) {
      return 2 ** (value / SCALING_CONSTANT);
    } else {
      return value;
    }
  }

  private static inverseScaling(value: number): number {
    if (SCALING_CONSTANT > 0) {
      return Math.log(value) / Math.log(2) * SCALING_CONSTANT;
    } else {
      return value;
    }
  }

  private static correction(round: number, value: number): number {
    let num = 0;
    let denom = 0;
    for (let i = 0 ; i < round + 1 ; i ++) {
      num += CORRECTION_WEIGHT ** (i * 2);
      denom += CORRECTION_WEIGHT ** i;
    }
    const current = Math.sqrt(num) / denom;
    const max = (1 - CORRECTION_WEIGHT) / Math.sqrt(1 - CORRECTION_WEIGHT ** 2);
    const correction = (current - max) / (1 - max) * Math.min(value * MAX_CORRECTION_RATE, MAX_CORRECTION);
    return correction;
  }

  public static colorIndex(rating: number): number {
    return Math.min(Math.floor(rating / COLOR_SPAN), COLOR_SIZE - 1);
  }

}


export class ChartRenderer {

  public context: CanvasRenderingContext2D;
  public history: History;
  public mouse: Coordinates;
  public nearestIndex: number;
  public previousIndex: number | null;
  public particles: Array<{index: number, createdTime: number}>;
  private timerSet: boolean;

  public constructor(context: CanvasRenderingContext2D) {
    this.context = context;
    this.history = new History();
    this.mouse = {x: 0, y: 0};
    this.nearestIndex = 0;
    this.previousIndex = null;
    this.particles = [];
    this.timerSet = false;
    this.context.canvas.addEventListener("mousemove", (event) => {
      const target = event.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      this.mouse.x = event.clientX - rect.left;
      this.mouse.y = event.clientY - rect.top;
    });
  }

  public update(history: History): void {
    this.history = history;
    this.nearestIndex = history.entries.length - 1;
    this.previousIndex = null;
    this.particles = [];
  }

  public render(): void {
    if (!this.timerSet) {
      setInterval(this.render.bind(this), INTERVAL);
      this.timerSet = true;
    }
    this.clearCanvas();
    if (this.history.entries.length > 0) {
      this.context.save();
      this.makeClipPath();
      this.context.clip();
      this.renderBackground();
      this.calculateNearestIndex();
      this.renderLine();
      this.renderParticles();
      this.renderMarker();
      this.context.restore();
      this.renderAxis();
      this.renderRating();
    }
  }

  private clearCanvas(): void {
    const context = this.context;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  }

  private makeClipPath(): void {
    const context = this.context;
    context.beginPath();
    context.arc(CHART_OFFSET_LEFT + CHART_BORDER_RADIUS, CHART_OFFSET_TOP + CHART_BORDER_RADIUS, CHART_BORDER_RADIUS, -Math.PI, -Math.PI / 2, false);
    context.arc(CHART_OFFSET_LEFT + CHART_WIDTH - CHART_BORDER_RADIUS, CHART_OFFSET_TOP + CHART_BORDER_RADIUS, CHART_BORDER_RADIUS, -Math.PI / 2, 0, false);
    context.arc(CHART_OFFSET_LEFT + CHART_WIDTH - CHART_BORDER_RADIUS, CHART_OFFSET_TOP + CHART_HEIGHT - CHART_BORDER_RADIUS, CHART_BORDER_RADIUS, 0, Math.PI / 2, false);
    context.arc(CHART_OFFSET_LEFT + CHART_BORDER_RADIUS, CHART_OFFSET_TOP + CHART_HEIGHT - CHART_BORDER_RADIUS, CHART_BORDER_RADIUS, Math.PI / 2, Math.PI, false);
    context.closePath();
  }

  private renderBackground(): void {
    const context = this.context;
    const history = this.history;
    for (let i = COLOR_SIZE - 1 ; i >= 0 ; i --) {
      const y = (i < COLOR_SIZE - 1) ? history.y(COLOR_SPAN * (i + 1)) : CHART_OFFSET_TOP;
      const height = (i < COLOR_SIZE - 1) ? history.y(COLOR_SPAN * i) - history.y(COLOR_SPAN * (i + 1)) + 20 : CHART_HEIGHT;
      const gapWidth = CHART_GAP_WIDTH;
      context.fillStyle = ChartRenderer.getStyleValue(".background-" + i, "color")!;
      context.beginPath();
      context.rect(CHART_OFFSET_LEFT, Math.floor(y), CHART_WIDTH, height);
      context.fill();
      context.clearRect(CHART_OFFSET_LEFT, Math.floor(y - gapWidth / 2), CHART_WIDTH, gapWidth);
    }
  }

  private calculateNearestIndex(): void {
    const entries = this.history.entries;
    const currentDate = new Date();
    let minDistance = null;
    let nearestIndex = null;
    for (let i = 0 ; i < entries.length ; i ++) {
      const distance = (entries[i].x - this.mouse.x) ** 2 + (entries[i].y - this.mouse.y) ** 2;
      if (distance < POPUP_DISTANCE && (minDistance === null || distance < minDistance)) {
        minDistance = distance;
        nearestIndex = i;
      }
    }
    if (nearestIndex !== null) {
      if (nearestIndex !== this.nearestIndex && nearestIndex !== this.previousIndex) {
        this.particles.push({index: nearestIndex, createdTime: currentDate.getTime()});
      }
      this.nearestIndex = nearestIndex;
    }
    this.previousIndex = nearestIndex;
  }

  private renderLine(): void {
    const context = this.context;
    const entries = this.history.entries;
    for (let i = 1 ; i < entries.length ; i ++) {
      context.strokeStyle = ChartRenderer.getStyleValue(".chart-line", "color")!;
      context.lineWidth = CHART_LINE_WIDTH;
      context.beginPath();
      context.moveTo(entries[i - 1].x, entries[i - 1].y);
      context.lineTo(entries[i].x, entries[i].y);
      context.stroke();
    }
  }

  private renderParticles(): void {
    const context = this.context;
    const entries = this.history.entries;
    const currentDate = new Date();
    for (const particle of this.particles) {
      const entry = entries[particle.index];
      const elapsedTime = currentDate.getTime() - particle.createdTime;
      if (elapsedTime < PARTICLE_LIFE) {
        const radius = elapsedTime / PARTICLE_LIFE * (PARTICLE_MAX_RADIUS - LARGE_MARKER_SIZE) + LARGE_MARKER_SIZE;
        const alpha = 1 - elapsedTime / PARTICLE_LIFE;
        context.strokeStyle = ChartRenderer.getStyleValue(".marker-" + History.colorIndex(entry.rating), "color")!;
        context.lineWidth = PARTICLE_LINE_WIDTH;
        context.globalAlpha = alpha;
        context.beginPath();
        context.arc(entry.x, entry.y, radius, 0, Math.PI * 2, false);
        context.stroke();
      }
    }
    this.particles = this.particles.filter((particle) => {
      return currentDate.getTime() - particle.createdTime < PARTICLE_LIFE;
    });
    context.globalAlpha = 1;
  }

  private renderMarker(): void {
    const context = this.context;
    const entries = this.history.entries;
    for (let j = 0 ; j < entries.length ; j ++) {
      const i = (j < this.nearestIndex) ? j : (j < entries.length - 1) ? j + 1 : this.nearestIndex;
      const rating = entries[i].rating;
      const radius = (i === this.nearestIndex) ? LARGE_MARKER_SIZE : MARKER_SIZE;
      const borderWidth = MARKER_BORDER_WIDTH;
      context.fillStyle = ChartRenderer.getStyleValue(".chart-line", "color")!;
      context.beginPath();
      context.arc(entries[i].x, entries[i].y, radius + 1, 0, Math.PI * 2, false);
      context.fill();
      context.fillStyle = ChartRenderer.getStyleValue(".marker-" + History.colorIndex(rating), "color")!;
      context.beginPath();
      context.arc(entries[i].x, entries[i].y, radius, 0, Math.PI * 2, false);
      context.fill();
    }
  }

  private renderAxis(): void {
    const context = this.context;
    const history = this.history;
    for (let i = 0 ; i < COLOR_SIZE - 1 ; i ++) {
      const y = history.y(COLOR_SPAN * (i + 1));
      if (y < CHART_OFFSET_TOP + CHART_HEIGHT && y > CHART_OFFSET_TOP) {
        context.font = ChartRenderer.getStyleValue(".chart-axis", "font")!;
        context.textAlign = "right";
        context.textBaseline = "middle";
        context.fillStyle = "black";
        context.fillText((COLOR_SPAN * (i + 1)).toString(), CHART_OFFSET_LEFT - 8, y);
      }
    }
  }

  private renderRating(): void {
    const context = this.context;
    const entries = this.history.entries;
    const index = this.nearestIndex;
    const rating = entries[index].rating;
    context.font = ChartRenderer.getStyleValue(".chart-rating", "font")!;
    context.textAlign = "right";
    context.textBaseline = "alphabetic";
    context.fillStyle = ChartRenderer.getStyleValue(".marker-" + History.colorIndex(rating), "color")!;
    context.fillText(rating.toFixed(DIGIT_SIZE), CHART_OFFSET_LEFT + CHART_WIDTH - 10, CHART_OFFSET_TOP - 10);
    context.font = ChartRenderer.getStyleValue(".chart-date", "font")!;
    context.textAlign = "left";
    context.textBaseline = "alphabetic";
    context.fillText(ElementFactory.createDateString(entries[index].date), CHART_OFFSET_LEFT + 10, CHART_OFFSET_TOP - 10);
    if (index === entries.length - 1) {
      context.font = ChartRenderer.getStyleValue(".chart-message", "font")!;
      context.textAlign = "left";
      context.textBaseline = "alphabetic";
      context.fillText("Latest", CHART_OFFSET_LEFT + 10, CHART_OFFSET_TOP - 30);
    }
  }

  public static getStyleValue(query: string, property: string): string | null {
    const element = document.querySelector<HTMLElement>(query);
    if (element !== null) {
      const value = window.getComputedStyle(element).getPropertyValue(property);
      return value;
    } else {
      return null;
    }
  }

}


export class ElementFactory {

  private history: History;

  public constructor() {
    this.history = new History();
  }

  public update(history: History): void {
    this.history = history;
  }

  public create(): HTMLElement {
    const entries = this.history.entries;
    const table = document.createElement("table");
    for (let i = 0 ; i < entries.length ; i ++) {
      const tr = document.createElement("tr");
      const dateString = ElementFactory.createDateString(entries[i].date);
      const scoreString = entries[i].score.toFixed(1);
      const previousRating = (i > 0) ? entries[i - 1].rating : 0;
      const rating = entries[i].rating;
      const differenceSign = (rating - previousRating >= 0) ? "+ " : "− ";
      const difference = Math.abs(rating - previousRating);
      const previousRatingString = (i > 0) ? previousRating.toFixed(DIGIT_SIZE) : "";
      const ratingString = rating.toFixed(DIGIT_SIZE);
      const differenceString = differenceSign + difference.toFixed(DIGIT_SIZE);
      tr.appendChild(ElementFactory.createTd((i + 1).toString(), "number"));
      tr.appendChild(ElementFactory.createTd(dateString, "date"));
      tr.appendChild(ElementFactory.createTd(scoreString, "score"));
      tr.appendChild(ElementFactory.createTd(previousRatingString, "previous-rating", previousRating));
      tr.appendChild(ElementFactory.createTd("\uF003", "arrow"));
      tr.appendChild(ElementFactory.createTd(ratingString, "rating", rating));
      tr.appendChild(ElementFactory.createTd(differenceString, "difference"));
      table.insertBefore(tr, table.firstChild);
    }
    return table;
  }

  private static createTd(text: string, clazz: string, rating?: number): HTMLElement {
    const td = document.createElement("td");
    const properClass = (rating === undefined) ? clazz : clazz + " marker-" + History.colorIndex(rating);
    td.setAttribute("class", properClass);
    td.textContent = text;
    return td;
  }

  public static createDateString(date: Date): string {
    let string = "";
    string += ("000" + date.getFullYear()).slice(-4);
    string += "/";
    string += ("0" + (date.getMonth() + 1)).slice(-2);
    string += "/";
    string += ("0" + date.getDate()).slice(-2);
    return string;
  }

}


export class Executor extends BaseExecutor {

  private context!: CanvasRenderingContext2D;
  private history: History;
  private renderer!: ChartRenderer;
  private factory: ElementFactory;

  public constructor() {
    super();
    this.history = new History();
    this.factory = new ElementFactory();
  }

  private getItem(keys: Array<string>): string | undefined {
    let value;
    for (const key of keys) {
      const candidate = localStorage.getItem(key);
      if (candidate !== null && candidate !== undefined) {
        value = candidate;
        break;
      }
    }
    return value;
  }

  private setItem(key: string, value: string, option?: any): void {
    localStorage.setItem(key, value);
  }

  private getParameters(): Parameter {
    let input = this.getItem(["randomizer_input", "input"]);
    let number = null;
    const modeString = this.getItem(["randomizer_mode", "mode"]);
    let mode = (modeString !== undefined) ? parseInt(modeString) : null;
    const pairs = location.search.substring(1).split("&");
    for (const pair of pairs) {
      let match = null as RegExpMatchArray | null;
      if ((match = pair.match(/input=(.+)/)) !== null) {
        input = decodeURIComponent(match[1]);
      } else if ((match = pair.match(/number=(.+)/)) !== null) {
        number = decodeURIComponent(match[1]);
      } else if ((match = pair.match(/mode=(.+)/)) !== null) {
        mode = parseInt(decodeURIComponent(match[1]));
      }
    }
    if (mode === null || Number.isNaN(mode)) {
      mode = 0;
    }
    return {input, number, mode};
  }

  protected prepare(): void {
    this.prepareVariables();
    this.prepareForms();
    this.prepareButtons();
  }

  private prepareVariables(): void {
    this.context = document.querySelector<HTMLCanvasElement>("#canvas")!.getContext("2d")!;
    this.history = new History();
    this.renderer = new ChartRenderer(this.context);
    this.factory = new ElementFactory();
  }

  private prepareForms(): void {
    const parameters = this.getParameters();
    const outerThis = this;
    const go = function (): void {
      if (parameters.input !== undefined) {
        document.querySelector<HTMLInputElement>("#input")!.value = parameters.input;
      }
      if (parameters.mode !== null) {
        const modeElements = document.querySelectorAll<HTMLInputElement>("input[name=\"mode\"]");
        for (const element of modeElements) {
          if (element.value === parameters.mode.toString()) {
            element.checked = true;
          }
        }
      }
      for (let i = 0 ; i < COLOR_SIZE ; i ++) {
        const canvas = document.querySelector("#canvas")!;
        const markerDiv = document.createElement("div");
        const backgroundDiv = document.createElement("div");
        markerDiv.setAttribute("class", "marker-" + i);
        backgroundDiv.setAttribute("class", "background-" + i);
        canvas.append(markerDiv, backgroundDiv);
      }
      if (parameters.input !== undefined) {
        outerThis.execute(true);
      }
    };
    if (parameters.number !== null) {
      document.querySelector<HTMLInputElement>("#input")!.value = "Loading";
      const request = new XMLHttpRequest();
      const url = INTERFACE_URL + "?mode=get&number=" + parameters.number;
      request.open("GET", url, true);
      request.send(null);
      request.addEventListener("readystatechange", (event) => {
        if (request.readyState === 4 && request.status === 200) {
          parameters.input = request.responseText;
          go();
        }
      });
    } else {
      go();
    }
  }

  private prepareButtons(): void {
    document.querySelector("#execute")!.addEventListener("click", () => {
      this.execute(false);
    });
    document.querySelector("#tweet")!.addEventListener("click", () => {
      this.tweet();
    });
  }

  private reset(): void {
    for (const element of document.querySelectorAll(".content .main .history")) {
      element.remove();
    }
  }

  private start(): void {
    const chartDiv = document.querySelector(".content .main .chart")!;
    const historyDiv = document.createElement("div")!;
    const table = this.factory.create();
    historyDiv.setAttribute("class", "history");
    historyDiv.appendChild(table);
    chartDiv.after(historyDiv);
    this.renderer.render();
  }

  private execute(first: boolean): void {
    const input = document.querySelector<HTMLInputElement>("#input")!.value;
    const modeString = document.querySelector<HTMLInputElement>("input[name=\"mode\"]:checked")!.value;
    const mode = parseInt(modeString) as HistoryMode;
    this.history.update(input, mode);
    this.renderer.update(this.history);
    this.factory.update(this.history);
    this.reset();
    this.start();
    if (!first) {
      this.setItem("randomizer_input", input, {path: "", expires: COOKIE_AGE});
      this.setItem("randomizer_mode", mode.toString(), {path: "", expires: COOKIE_AGE});
    }
  }

  private tweet(): void {
    const entries = this.history.entries;
    if (entries !== undefined && entries.length > 0) {
      const input = document.querySelector<HTMLInputElement>("#input")!.value;
      const rating = entries[entries.length - 1].rating;
      const ratingString = rating.toFixed(DIGIT_SIZE);
      const colorName = COLOR_NAMES[History.colorIndex(rating)];
      const numberRequest = new XMLHttpRequest();
      const numberUrl = INTERFACE_URL + "?mode=get_number";
      numberRequest.open("GET", numberUrl, true);
      numberRequest.send(null);
      numberRequest.addEventListener("readystatechange", (event) => {
        if (numberRequest.readyState === 4 && numberRequest.status === 200) {
          const number = numberRequest.responseText;
          let url = location.protocol + "//" + location.host + location.pathname;
          const option = "width=" + TWITTER_WIDTH + ",height=" + TWITTER_HEIGHT + ",menubar=no,toolbar=no,scrollbars=no";
          let href = "https://twitter.com/intent/tweet";
          url += "?number=" + encodeURIComponent(number);
          url += "&mode=" + this.history.mode;
          href += "?text=" + TWITTER_MESSAGE.replace(/%r/g, ratingString).replace(/%c/g, colorName);
          href += "&url=" + encodeURIComponent(url);
          href += "&hashtags=" + TWITTER_HASHTAG;
          const twitterRequest = new XMLHttpRequest();
          const twitterUrl = INTERFACE_URL;
          const data = "mode=save&number=" + number + "&content=" + encodeURIComponent(input);
          twitterRequest.open("POST", twitterUrl);
          twitterRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
          twitterRequest.send(data);
          window.open(href, "_blank", option);
        }
      });
    }
  }

}


Executor.regsiter();
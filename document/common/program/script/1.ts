/// <reference path="../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {
  BaseExecutor
} from "./module/executor";
import {
  FloorMath
} from "./module/math";


type Hairia = number;


export class AbstractDate {

  public year: number;
  public month: number;
  public day: number;

  public constructor(year: number, month: number, day: number) {
    this.year = year;
    this.month = month;
    this.day = day;
  }

}


export abstract class Calendar {

  public name: string;

  public constructor(name: string = "") {
    this.name = name;
  }

  public abstract fromHairia(hairia: Hairia): AbstractDate;

  public abstract toHairia(date: AbstractDate): Hairia;

}


export class OldHairian extends Calendar {

  public fromHairia(hairia: Hairia): AbstractDate {
    let time = (hairia - 1) * 120000;
    let year = FloorMath.div(time, 36000000) + 1;
    let month = FloorMath.div(FloorMath.mod(time, 36000000), 3000000) + 1;
    let day = FloorMath.div(FloorMath.mod(FloorMath.mod(time, 36000000), 3000000), 120000) + 1;
    return new AbstractDate(year, month, day);
  }

  public toHairia(date: AbstractDate): Hairia {
    let year = date.year;
    let month = date.month;
    let day = date.day;
    let hairia = (year - 1) * 300 + (month - 1) * 25 + day;
    return hairia;
  }

}


export class NewHairian extends Calendar {

  public fromHairia(hairia: Hairia): AbstractDate {
    let count = hairia + 547862;
    let rawYear = FloorMath.div(4 * count + 3 + 4 * FloorMath.div(3 * (FloorMath.div(4 * (count + 1), 146097) + 1), 4), 1461);
    let remainder = count - (365 * rawYear + FloorMath.div(rawYear, 4) - FloorMath.div(rawYear, 100) + FloorMath.div(rawYear, 400));
    let year = rawYear + 1 - 1500;
    let month = FloorMath.div(remainder, 33) + 1;
    let day = FloorMath.mod(remainder, 33) + 1;
    return new AbstractDate(year, month, day);
  }

  public toHairia(date: AbstractDate): Hairia {
    let year = date.year + 1500;
    let month = date.month;
    let day = date.day;
    let hairia = 365 * (year - 1) + FloorMath.div(year - 1, 4) - FloorMath.div(year - 1, 100) + FloorMath.div(year - 1, 400) + (month - 1) * 33 + day - 547863;
    return hairia;
  }

}


export class Gregorian extends Calendar {

  public fromHairia(hairia: Hairia): AbstractDate {
    let julian = hairia + 734829;
    let rawYear = 4 * julian + 3 + 4 * FloorMath.div(3 * (FloorMath.div(4 * (julian + 1), 146097) + 1), 4);
    let rawMonth = 5 * FloorMath.div(FloorMath.mod(rawYear, 1461), 4) + 2;
    let tempYear = FloorMath.div(rawYear, 1461);
    let tempMonth = FloorMath.div(rawMonth, 153);
    let tempDay = FloorMath.div(FloorMath.mod(rawMonth, 153), 5);
    let month = FloorMath.mod(tempMonth + 2, 12) + 1;
    let year = tempYear - FloorMath.div(month - 3, 12);
    let day = tempDay + 1;
    return new AbstractDate(year, month, day);
  }

  public fromDate(date: Date): AbstractDate {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    return new AbstractDate(year, month, day);
  }

  public toHairia(date: AbstractDate): Hairia {
    let year = date.year;
    let month = date.month;
    let day = date.day;
    let tempYear = year + FloorMath.div(month - 3, 12);
    let tempMonth = FloorMath.mod(month - 3, 12);
    let tempDay = day - 1;
    let addition = FloorMath.div(153 * tempMonth + 2, 5) + 365 * tempYear + FloorMath.div(tempYear, 4) - FloorMath.div(tempYear, 100) + FloorMath.div(tempYear, 400) - 734829;
    let hairia = tempDay + addition;
    return hairia;
  }

}


export class RawHairia extends Calendar {

  public fromHairia(hairia: Hairia): AbstractDate {
    let year = 0;
    let month = 0;
    let day = hairia;
    return new AbstractDate(year, month, day);
  }

  public toHairia(date: AbstractDate): Hairia {
    let hairia = date.day;
    return hairia;
  }

}


export class Executor extends BaseExecutor {

  private calendars: Array<Calendar>;

  public constructor() {
    super();
    this.calendars = this.createCalendars();
  }

  protected prepare(): void {
    this.prepareInitial();
    this.prepareButtons();
    this.prepareEvents();
  }

  private prepareInitial(): void {
    let calendar = new Gregorian();
    let currentDate = new Date();
    let hairia = calendar.toHairia(calendar.fromDate(currentDate));
    this.update(hairia);
  }

  private prepareButtons(): void {
    for (let calendar of this.calendars) {
      let button = document.querySelector<HTMLInputElement>("#" + calendar.name);
      if (button) {
        button.addEventListener("click", (event) => {
          this.updateFrom(calendar);
        });
      }
    }
  }

  private prepareEvents(): void {
    for (let calendar of this.calendars) {
      for (let type of ["year", "month", "day"]) {
        let element = document.querySelector<HTMLInputElement>("#" + calendar.name + "-" + type);
        if (element) {
          element.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
              this.updateFrom(calendar);
            } else if (event.key === "ArrowUp") {
              this.updateFrom(calendar, 1);
            } else if (event.key === "ArrowDown") {
              this.updateFrom(calendar, -1);
            }
          });
        }
      }
    }
  }

  private getDate(calendar: Calendar): AbstractDate {
    let yearElement = document.querySelector<HTMLInputElement>("#" + calendar.name + "-year");
    let monthElement = document.querySelector<HTMLInputElement>("#" + calendar.name + "-month");
    let dayElement = document.querySelector<HTMLInputElement>("#" + calendar.name + "-day");
    let date = new AbstractDate(0, 0, 0);
    if (yearElement) {
      date.year = parseInt(yearElement.value);
    }
    if (monthElement) {
      date.month = parseInt(monthElement.value);
    }
    if (dayElement) {
      date.day = parseInt(dayElement.value);
    }
    return date;
  }

  private update(hairia: Hairia): void {
    for (let calendar of this.calendars) {
      let yearElement = document.querySelector<HTMLInputElement>("#" + calendar.name + "-year");
      let monthElement = document.querySelector<HTMLInputElement>("#" + calendar.name + "-month");
      let dayElement = document.querySelector<HTMLInputElement>("#" + calendar.name + "-day");
      let date = calendar.fromHairia(hairia);
      if (yearElement) {
        yearElement.value = date.year.toString();
      }
      if (monthElement) {
        monthElement.value = date.month.toString();
      }
      if (dayElement) {
        dayElement.value = date.day.toString();
      }
    }
  }

  private updateFrom(calendar: Calendar, offset: number = 0): void {
    let date = this.getDate(calendar);
    let hairia = calendar.toHairia(date) + offset;
    this.update(hairia);
  }

  private createCalendars(): Array<Calendar> {
    let calendars = [] as Array<Calendar>;
    calendars.push(new OldHairian("old-hairian"));
    calendars.push(new NewHairian("new-hairian"));
    calendars.push(new Gregorian("gregorian"));
    calendars.push(new RawHairia("hairia"));
    return calendars;
  }

}


Executor.regsiter();
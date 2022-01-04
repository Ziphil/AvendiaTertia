//


export class FloorMath {

  public static div(a: number, b: number): number {
    if (a >= 0) {
      return Math.floor(a / b);
    } else {
      return - Math.floor((b - a - 1) / b);
    }
  }

  public static mod(a: number, b: number): number {
    return a - FloorMath.div(a, b) * b;
  }

}
import { SandcastleBuilderNotation } from ".";

export type ShowSign = "remove" | "negative" | "always";

export interface INumberNotation {
  number(value: number, precision: number, showSign: ShowSign): string;
  percent(value: number, precision: number, showSign: ShowSign): string;
}

export class NumberFormatter {
  private readonly notation = new SandcastleBuilderNotation();

  constructor(public precision: number) {}

  number(v: number, showSign: ShowSign = "negative"): string {
    return this.notation.number(v, this.precision, showSign);
  }

  percent(v: number, showSign: ShowSign = "negative"): string {
    return this.notation.percent(v, this.precision, showSign);
  }
}

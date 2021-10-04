import { INumberNotation, ShowSign } from "@/_utils/notation";

export class NumberFormatter {
  constructor(
    public precision: number,
    private readonly notation: INumberNotation,
  ) {}

  number(v: number, showSign: ShowSign = "negative"): string {
    return this.notation.number(v, this.precision, showSign);
  }

  percent(v: number, showSign: ShowSign = "negative"): string {
    return this.notation.number(v * 100, this.precision, showSign) + "%";
  }
}

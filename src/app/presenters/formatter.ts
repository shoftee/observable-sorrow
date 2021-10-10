import { UnitKind } from "@/_interfaces";
import { INumberNotation, ShowSign } from "@/_utils/notation";

import { NumberView } from ".";

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

  rounded(v: number, showSign: ShowSign = "negative"): string {
    return this.notation.number(v, 0, showSign);
  }

  v(view: NumberView): string {
    const { value, unit } = view;
    const precision = view.rounded === true ? 0 : this.precision;
    const showSign = view.showSign ?? "negative";
    switch (unit) {
      case UnitKind.Percent:
        return this.notation.number(value * 100, precision, showSign) + "%";
      case UnitKind.PerTick:
        return this.notation.number(value, precision, showSign) + "/t";
      case UnitKind.None:
        return this.notation.number(value, precision, showSign);
    }
  }
}

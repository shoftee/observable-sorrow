import { UnitKind } from "@/_interfaces";
import { INumberNotation, ShowSign } from "@/_utils/notation";

import { IStateManager, NumberView } from ".";

export interface FormattingOptions {
  precision: number;
  units: "ticks" | "seconds";
}

export class NumberFormatter {
  constructor(
    private readonly manager: IStateManager,
    private readonly notation: INumberNotation,
    public options: FormattingOptions,
  ) {}

  number(v: number, showSign: ShowSign = "negative"): string {
    return this.notation.number(v, this.options.precision, showSign);
  }

  percent(v: number, showSign: ShowSign = "negative"): string {
    return (
      this.notation.number(v * 100, this.options.precision, showSign) + "%"
    );
  }

  rounded(v: number, showSign: ShowSign = "negative"): string {
    return this.notation.number(v, 0, showSign);
  }

  v(view: NumberView): string {
    const { value, unit } = view;
    const precision = view.rounded === true ? 0 : this.options.precision;
    const showSign = view.showSign ?? "negative";
    switch (unit) {
      case UnitKind.Percent:
        return this.notation.number(value * 100, precision, showSign) + "%";
      case UnitKind.Tick: {
        if (this.options.units === "ticks") {
          return this.notation.number(value, precision, showSign) + "t";
        } else {
          return (
            this.notation.number(
              value / (1000 / this.manager.time().millisPerTick),
              precision,
              showSign,
            ) + "s"
          );
        }
      }
      case UnitKind.PerTick: {
        if (this.options.units === "ticks") {
          return this.notation.number(value, precision, showSign) + "/t";
        } else {
          return (
            this.notation.number(
              value * (1000 / this.manager.time().millisPerTick),
              precision,
              showSign,
            ) + "/s"
          );
        }
      }
      case UnitKind.None:
        return this.notation.number(value, precision, showSign);
    }
  }
}

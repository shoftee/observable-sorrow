import { ShowSign } from "@/app/interfaces";
import { UnitKind } from "@/app/state";

import { IStateManager } from ".";
import { SandcastleBuilderFormatter, NumberView } from "./common";

export interface FormattingOptions {
  precision: number;
  units: "ticks" | "seconds";
}

export class NumberFormatter {
  private readonly fmt = SandcastleBuilderFormatter;

  constructor(
    private readonly manager: IStateManager,
    public options: FormattingOptions,
  ) {}

  number(v: number, showSign: ShowSign = "negative"): string {
    return this.fmt(v, this.options.precision, showSign);
  }

  percent(v: number, showSign: ShowSign = "negative"): string {
    return this.fmt(v * 100, this.options.precision, showSign) + "%";
  }

  rounded(v: number, showSign: ShowSign = "negative"): string {
    return this.fmt(v, 0, showSign);
  }

  v(view: NumberView): string {
    const precision = view.rounded === true ? 0 : this.options.precision;
    const showSign = view.showSign ?? "negative";
    const value = view.style.invert === true ? -view.value : view.value;
    switch (view.style.unit) {
      case UnitKind.Percent:
        return this.fmt(value * 100, precision, showSign) + "%";
      case UnitKind.Tick: {
        if (this.options.units === "ticks") {
          return this.fmt(value, precision, showSign) + "t";
        } else {
          return this.fmt(value / this.tps, precision, showSign) + "s";
        }
      }
      case UnitKind.PerTick: {
        if (this.options.units === "ticks") {
          return this.fmt(value, precision, showSign) + "/t";
        } else {
          return this.fmt(value * this.tps, precision, showSign) + "/s";
        }
      }
      case UnitKind.None:
        return this.fmt(value, precision, showSign);
    }
  }

  private get tps(): number {
    return 1000 / this.manager.time().millisPerTick;
  }
}

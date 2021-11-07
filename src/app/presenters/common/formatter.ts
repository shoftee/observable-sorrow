import { NumberEffectId, ShowSign } from "@/app/interfaces";
import {
  EffectDisplayStyle,
  EffectDisplayStyles,
  EffectState,
} from "@/app/state";
import { round } from "@/app/utils/mathx";

function scale(limit: number, divisor: number, postfix: string) {
  return { limit, divisor, postfix };
}

// almost shamelessly copied from Sandcastle Builder
// https://github.com/eternaldensity/Sandcastle-Builder/blob/master/redundancy.js
const scales = [
  scale(1e210, 1e210, "Q"),
  scale(1e42, 1e42, "W"),
  scale(1e39, 1e39, "L"),
  scale(1e36, 1e36, "F"),
  scale(1e33, 1e33, "H"),
  scale(1e30, 1e30, "S"),
  scale(1e27, 1e27, "U"),
  scale(1e24, 1e24, "Y"),
  scale(1e21, 1e21, "Z"),
  scale(1e18, 1e18, "E"),
  scale(1e15, 1e15, "P"),
  scale(1e12, 1e12, "T"),
  scale(1e9, 1e9, "G"),
  scale(1e6, 1e6, "M"),

  // start displaying K only when we're almost at 5 digits.
  scale(9e3, 1e3, "K"),
];

function getSignString(value: number, showSign: ShowSign): string {
  const sign = Math.sign(value);
  switch (showSign) {
    case "negative":
      if (sign < 0) return "-";
      break;

    case "always":
      if (sign >= 0) return "+";
      if (sign < 0) return "-";
      break;
  }

  return "";
}

function getValueString(value: number, precision: number): string {
  let postfix = "";

  for (const scale of scales) {
    const rounded = round(value, precision);
    // at the high end of double, round() will return infinity
    // if this happens, ignore the rounding operation for this scale
    if (Number.isFinite(rounded)) {
      value = rounded;
    }
    while (value + Number.EPSILON >= scale.limit) {
      postfix = scale.postfix + postfix;
      value /= scale.divisor;
    }
  }

  value = round(value, precision);

  const valueString = Number.isInteger(value)
    ? value.toFixed(0)
    : value.toFixed(precision);

  return valueString + postfix;
}

export const SandcastleBuilderFormatter = (
  value: number,
  precision: number,
  showSign: ShowSign,
): string => {
  const signString = getSignString(value, showSign);
  let valueString: string;
  if (Number.isFinite(value)) {
    const absValue = Math.abs(value);
    valueString = getValueString(absValue, precision);
  } else {
    valueString = Number.POSITIVE_INFINITY.toString();
  }

  return signString + valueString;
};

export interface NumberView {
  value: number | undefined;
  style: EffectDisplayStyle;
  rounded?: boolean;
  showSign?: ShowSign;
}

interface NumberProvider {
  number(id: NumberEffectId): EffectState<number>;
}

export function numberView(
  id: NumberEffectId,
  manager: NumberProvider,
): NumberView {
  return {
    value: manager.number(id).value,
    style: EffectDisplayStyles[id],
    rounded: false,
    showSign: "always",
  };
}

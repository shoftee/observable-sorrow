import { round } from "../mathx";

import { ShowSign } from ".";

export class SandcastleBuilderNotation {
  number(value: number, precision: number, showSign: ShowSign): string {
    const signString = getSignString(value, showSign);
    let valueString: string;
    if (Number.isFinite(value)) {
      const absValue = Math.abs(value);
      valueString = getValueString(absValue, precision);
    } else {
      valueString = Number.POSITIVE_INFINITY.toString();
    }

    return signString + valueString;
  }
}

// almost shamelessly copied from Sandcastle Builder
// https://github.com/eternaldensity/Sandcastle-Builder/blob/master/redundancy.js
const scales = [
  { limit: 1e210, divisor: 1e210, postfix: "Q" },
  { limit: 1e42, divisor: 1e42, postfix: "W" },
  { limit: 1e39, divisor: 1e39, postfix: "L" },
  { limit: 1e36, divisor: 1e36, postfix: "F" },
  { limit: 1e33, divisor: 1e33, postfix: "H" },
  { limit: 1e30, divisor: 1e30, postfix: "S" },
  { limit: 1e27, divisor: 1e27, postfix: "U" },
  { limit: 1e24, divisor: 1e24, postfix: "Y" },
  { limit: 1e21, divisor: 1e21, postfix: "Z" },
  { limit: 1e18, divisor: 1e18, postfix: "E" },
  { limit: 1e15, divisor: 1e15, postfix: "P" },
  { limit: 1e12, divisor: 1e12, postfix: "T" },
  { limit: 1e9, divisor: 1e9, postfix: "G" },
  { limit: 1e6, divisor: 1e6, postfix: "M" },

  // start displaying K only when we're almost at 5 digits.
  { limit: 9e3, divisor: 1e3, postfix: "K" },
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

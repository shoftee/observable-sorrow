import { EffectId } from "../_interfaces/id";

import { Expr, constant, sum, ratio, product } from ".";

export const EffectExpressions: Partial<Record<EffectId, Expr>> = {
  // Base limits
  "catnip-limit-base": constant(5000),
  "wood-limit-base": constant(200),

  // Calculated limits
  "catnip-limit": sum("catnip-limit-base"),
  "wood-limit": sum("wood-limit-base"),

  // Production
  "catnip-production": ratio("catnip-field-production", "catnip-field-weather"),

  // Catnip field effects
  "catnip-field-production": product(
    "catnip-field-base-catnip",
    "catnip-field-count",
  ),
  "catnip-field-base-catnip": constant(0.125),
  "catnip-field-weather": sum(
    "weather-season-modifier",
    "weather-severity-modifier",
  ),
};

import { EffectId } from "./_id";
import {
  AdditionModifier as add,
  ProportionalModifier as ratio,
  MultiplicationModifier as times,
  BaseEffect as base,
  VariableEffect as variable,
  CompoundEffect as calc,
  EffectMetadataType,
} from "./_types";

export const EffectMetadata: Record<EffectId, EffectMetadataType> = {
  // Base limits
  "catnip-limit-base": {
    id: "catnip-limit-base",
    value: base(5000),
  },
  "wood-limit-base": {
    id: "wood-limit-base",
    value: base(200),
  },
  // Calculated limits
  "catnip-limit": {
    id: "catnip-limit",
    value: calc(add("catnip-limit-base")),
  },
  "wood-limit": {
    id: "wood-limit",
    value: calc(add("wood-limit-base")),
  },
  // Production
  "catnip-production": {
    id: "catnip-production",
    value: calc(add("catnip-field-production"), ratio("catnip-field-weather")),
  },
  "wood-production": {
    id: "wood-production",
    value: variable(),
  },
  // Building counts
  "catnip-field-count": {
    id: "catnip-field-count",
    value: variable(),
  },
  // Catnip field effects
  "catnip-field-production": {
    id: "catnip-field-production",
    value: calc(add("catnip-field-base-catnip"), times("catnip-field-count")),
  },
  "catnip-field-base-catnip": {
    id: "catnip-field-base-catnip",
    value: base(0.125),
  },
  "catnip-field-weather": {
    id: "catnip-field-weather",
    value: calc(
      add("weather-season-modifier"),
      add("weather-severity-modifier"),
    ),
  },
  // Weather effects
  "weather-season-modifier": {
    id: "weather-season-modifier",
    value: variable(),
  },
  "weather-severity-modifier": {
    id: "weather-severity-modifier",
    value: variable(),
  },
};

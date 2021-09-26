import { BaseEffect, MultiplicationModifier, VariableEffect } from ".";
import { EffectId } from "./_id";
import {
  AbsoluteModifier,
  CompoundEffect,
  EffectMetadataType,
  ProportionalModifier,
} from "./_types";

export const EffectMetadata: Record<EffectId, EffectMetadataType> = {
  "catnip-production": {
    id: "catnip-production",
    value: CompoundEffect(
      AbsoluteModifier("catnip-field-production"),
      ProportionalModifier("catnip-field-weather"),
    ),
  },
  "catnip-limit": {
    id: "catnip-limit",
    value: CompoundEffect(AbsoluteModifier("catnip-limit-base")),
  },
  "catnip-limit-base": {
    id: "catnip-limit-base",
    value: BaseEffect(5000),
  },
  "catnip-field-production": {
    id: "catnip-field-production",
    value: CompoundEffect(
      AbsoluteModifier("catnip-field-base-catnip"),
      MultiplicationModifier("catnip-field-count"),
    ),
  },
  "catnip-field-base-catnip": {
    id: "catnip-field-base-catnip",
    value: BaseEffect(0.125),
  },
  "catnip-field-count": {
    id: "catnip-field-count",
    value: VariableEffect(),
  },
  "catnip-field-weather": {
    id: "catnip-field-weather",
    value: CompoundEffect(
      AbsoluteModifier("weather-season-modifier"),
      AbsoluteModifier("weather-severity-modifier"),
    ),
  },
  "weather-season-modifier": {
    id: "weather-season-modifier",
    value: VariableEffect(),
  },
  "weather-severity-modifier": {
    id: "weather-severity-modifier",
    value: VariableEffect(),
  },
  "wood-production": {
    id: "wood-production",
    value: VariableEffect(),
  },
  "wood-limit": {
    id: "wood-limit",
    value: CompoundEffect(AbsoluteModifier("wood-limit-base")),
  },
  "wood-limit-base": {
    id: "wood-limit-base",
    value: BaseEffect(200),
  },
};

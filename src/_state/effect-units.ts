import { EffectId } from "@/_interfaces";

export enum UnitKind {
  None,
  PerTick,
  Percent,
}

export const EffectUnits: Partial<Record<EffectId, UnitKind>> = {
  "catnip.delta": UnitKind.PerTick,
  "catnip-field.catnip": UnitKind.PerTick,
  "catnip-field.catnip.base": UnitKind.PerTick,
  "catnip-field.weather": UnitKind.Percent,
  "population.growth": UnitKind.PerTick,
  "population.starvation": UnitKind.PerTick,
};

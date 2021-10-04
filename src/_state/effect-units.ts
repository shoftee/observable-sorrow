import { EffectId } from "@/_interfaces";

export enum UnitKind {
  None,
  PerTick,
  Percent,
}

export const EffectUnits: Partial<Record<EffectId, UnitKind>> = {
  "catnip.production": UnitKind.PerTick,
  "catnip-field.catnip": UnitKind.PerTick,
  "catnip-field.catnip.base": UnitKind.PerTick,
  "catnip-field.weather": UnitKind.Percent,

  "catpower.production": UnitKind.PerTick,

  "wood.production": UnitKind.PerTick,
};

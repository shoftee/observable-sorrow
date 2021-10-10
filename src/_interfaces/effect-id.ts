export type ProductionEffectId =
  | "catnip.production"
  | "wood.production"
  | "catpower.production";
export type DeltaEffectId = "catnip.delta";

export type LimitEffectId =
  | "catnip.limit"
  | "catnip.limit.base"
  | "wood.limit"
  | "wood.limit.base"
  | "kittens.limit"
  | "catpower.limit";

export type CatnipFieldEffectId =
  | "catnip-field.weather"
  | "catnip-field.catnip"
  | "catnip-field.catnip.base";

export type HutEffectId =
  | "hut.catpower"
  | "hut.catpower.base"
  | "hut.kittens"
  | "hut.kittens.base";

export type PopulationEffectId =
  | "population.growth"
  | "population.starvation"
  | "population.demand"
  | "population.demand.base";

export type EffectId =
  | ProductionEffectId
  | DeltaEffectId
  | LimitEffectId
  | CatnipFieldEffectId
  | HutEffectId
  | PopulationEffectId
  | "weather.modifier.season"
  | "weather.modifier.severity";

export enum UnitKind {
  None,
  Tick,
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

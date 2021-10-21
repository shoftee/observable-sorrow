export type ProductionEffectId = "catnip.production" | "wood.production";
export type DeltaEffectId = "catnip.delta" | "wood.delta";

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

export type JobEffectId = "jobs.woodcutter.wood.base" | "jobs.woodcutter.wood";

export type PopulationEffectId =
  | "population.catnip.demand"
  | "population.catnip.demand.base";

export type NumberEffectId =
  | ProductionEffectId
  | DeltaEffectId
  | LimitEffectId
  | CatnipFieldEffectId
  | HutEffectId
  | PopulationEffectId
  | JobEffectId
  | "weather.modifier.season"
  | "weather.modifier.severity";

export enum UnitKind {
  None,
  Tick,
  PerTick,
  Percent,
}

export const EffectUnits: Partial<Record<NumberEffectId, UnitKind>> = {
  "catnip.delta": UnitKind.PerTick,
  "catnip-field.catnip": UnitKind.PerTick,
  "catnip-field.catnip.base": UnitKind.PerTick,
  "catnip-field.weather": UnitKind.Percent,
  "jobs.woodcutter.wood": UnitKind.PerTick,
  "jobs.woodcutter.wood.base": UnitKind.PerTick,
};

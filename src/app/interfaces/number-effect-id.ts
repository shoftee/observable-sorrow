export type ProductionEffectId =
  | "catnip.production"
  | "wood.production"
  | "science.production";
export type DeltaEffectId = "catnip.delta" | "wood.delta" | "science.delta";
export type RatioEffectId =
  | "science.ratio"
  | "weather.season-ratio"
  | "weather.severity-ratio";

export type LimitEffectId =
  | "catnip.limit"
  | "catnip.limit.base"
  | "wood.limit"
  | "wood.limit.base"
  | "kittens.limit"
  | "catpower.limit"
  | "science.limit"
  | "culture.limit";

export type CatnipFieldEffectId =
  | "catnip-field.weather"
  | "catnip-field.catnip"
  | "catnip-field.catnip.base";

export type HutEffectId =
  | "hut.catpower-limit"
  | "hut.catpower-limit.base"
  | "hut.kittens-limit"
  | "hut.kittens-limit.base";

export type LibraryEffectId =
  | "library.science-limit"
  | "library.science-limit.base"
  | "library.science-ratio"
  | "library.science-ratio.base"
  | "library.culture-limit"
  | "library.culture-limit.base";

export type JobEffectId =
  | "jobs.woodcutter.wood.base"
  | "jobs.woodcutter.wood"
  | "jobs.scholar.science.base"
  | "jobs.scholar.science";

export type PopulationEffectId =
  | "population.catnip-demand"
  | "population.catnip-demand.base";

export type NumberEffectId =
  | ProductionEffectId
  | DeltaEffectId
  | RatioEffectId
  | LimitEffectId
  | CatnipFieldEffectId
  | HutEffectId
  | LibraryEffectId
  | PopulationEffectId
  | JobEffectId;

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
  "jobs.scholar.science": UnitKind.PerTick,
  "jobs.scholar.science.base": UnitKind.PerTick,
  "weather.season-ratio": UnitKind.Percent,
  "weather.severity-ratio": UnitKind.Percent,
  "library.science-ratio": UnitKind.Percent,
  "library.science-ratio.base": UnitKind.Percent,
};

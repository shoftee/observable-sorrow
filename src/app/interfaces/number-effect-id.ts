export type ProductionEffectId =
  | "catnip.production"
  | "wood.production"
  | "science.production";

export type DeltaEffectId = "catnip.delta" | "wood.delta" | "science.delta";

export type RatioEffectId =
  | "science.ratio"
  | "weather.season-ratio"
  | "weather.severity-ratio";

export type AstronomyEffectId =
  | "astronomy.rare-event.reward"
  | "astronomy.rare-event.reward.base";

export type LimitEffectId =
  | "catnip.limit"
  | "catnip.limit.base"
  | "wood.limit"
  | "wood.limit.base"
  | "kittens.limit"
  | "science.limit";

export type CatnipFieldEffectId =
  | "weather.ratio"
  | "catnip-field.catnip"
  | "catnip-field.catnip.base";

export type HutEffectId = "hut.kittens-limit" | "hut.kittens-limit.base";

export type LibraryEffectId =
  | "library.science-limit"
  | "library.science-limit.base"
  | "library.science-ratio"
  | "library.science-ratio.base";

export type BarnEffectId =
  | "barn.catnip-limit"
  | "barn.catnip-limit.base"
  | "barn.wood-limit"
  | "barn.wood-limit.base";

export type JobEffectId =
  | "jobs.woodcutter.wood.base"
  | "jobs.woodcutter.wood"
  | "jobs.scholar.science.base"
  | "jobs.scholar.science"
  | "jobs.farmer.catnip.base"
  | "jobs.farmer.catnip";

export type PopulationEffectId =
  | "population.catnip-demand"
  | "population.catnip-demand.base";

export type NumberEffectId =
  | ProductionEffectId
  | DeltaEffectId
  | RatioEffectId
  | LimitEffectId
  | AstronomyEffectId
  | CatnipFieldEffectId
  | HutEffectId
  | LibraryEffectId
  | BarnEffectId
  | PopulationEffectId
  | JobEffectId;

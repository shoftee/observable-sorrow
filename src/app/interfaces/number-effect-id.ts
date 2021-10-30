export type ProductionEffectId =
  | "catnip.production"
  | "wood.production"
  | "science.production";
export type DeltaEffectId =
  | "catnip.delta"
  | "wood.delta"
  | "science.delta"
  | "culture.delta";
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
  | "catpower.limit"
  | "science.limit"
  | "culture.limit";

export type CatnipFieldEffectId =
  | "weather.ratio"
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
  | PopulationEffectId
  | JobEffectId;

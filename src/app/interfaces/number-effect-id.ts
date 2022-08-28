export type ProductionEffectId =
  | "catnip.production"
  | "wood.production"
  | "minerals.production"
  | "science.production"
  | "catpower.production";

export type DeltaEffectId =
  | "catnip.delta"
  | "wood.delta"
  | "minerals.delta"
  | "science.delta"
  | "catpower.delta";

export type RatioEffectId =
  | "science.ratio"
  | "minerals.ratio"
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
  | "minerals.limit"
  | "minerals.limit.base"
  | "science.limit"
  | "catpower.limit"
  | "catpower.limit.base"
  | "kittens.limit";

export type ModifierEffectId = "weather.ratio";

export type CatnipFieldEffectId =
  | "catnip-field.catnip"
  | "catnip-field.catnip.base";

export type HutEffectId =
  | "hut.kittens-limit"
  | "hut.kittens-limit.base"
  | "hut.catpower-limit"
  | "hut.catpower-limit.base";

export type LibraryEffectId =
  | "library.science-limit"
  | "library.science-limit.base"
  | "library.science-ratio"
  | "library.science-ratio.base";

export type BarnEffectId =
  | "barn.catnip-limit"
  | "barn.catnip-limit.base"
  | "barn.wood-limit"
  | "barn.wood-limit.base"
  | "barn.minerals-limit"
  | "barn.minerals-limit.base";

export type MineEffectId = "mine.minerals-ratio" | "mine.minerals-ratio.base";

export type JobEffectId =
  | "jobs.woodcutter.wood.base"
  | "jobs.woodcutter.wood"
  | "jobs.scholar.science.base"
  | "jobs.scholar.science"
  | "jobs.farmer.catnip.base"
  | "jobs.farmer.catnip"
  | "jobs.hunter.catpower.base"
  | "jobs.hunter.catpower"
  | "jobs.miner.minerals.base"
  | "jobs.miner.minerals";

export type PopulationEffectId =
  | "population.happiness.total"
  | "population.happiness.base"
  | "population.overpopulation"
  | "population.overpopulation.base"
  | "population.overpopulation.severity"
  | "population.catnip-demand"
  | "population.catnip-demand.base";

export type NumberEffectId =
  | ProductionEffectId
  | DeltaEffectId
  | RatioEffectId
  | LimitEffectId
  | ModifierEffectId
  | AstronomyEffectId
  | CatnipFieldEffectId
  | HutEffectId
  | LibraryEffectId
  | BarnEffectId
  | MineEffectId
  | PopulationEffectId
  | JobEffectId;

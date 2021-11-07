import { NumberEffectId } from "@/app/interfaces";

export type EffectState<T> = { value: T | undefined };

export class EffectTreeState extends Map<NumberEffectId, Set<NumberEffectId>> {}

export enum UnitKind {
  None,
  Tick,
  PerTick,
  Percent,
}

type EffectStyleDisposition = "none" | "hide" | "inline" | "collapse";

export type EffectDisplayStyle = Readonly<{
  unit: UnitKind;
  invert?: boolean;
  label?: string;
  disposition?: EffectStyleDisposition;
}>;

export const EffectDisplayStyles: Record<NumberEffectId, EffectDisplayStyle> = {
  // Deltas
  // Catnip
  "catnip.delta": perTick("inline"),
  "catnip.production": perTick("inline"),
  "catnip-field.catnip": {
    ...perTick("collapse"),
    label: "effect-tree.catnip-fields",
  },
  "catnip-field.catnip.base": perTick(),
  "weather.ratio": { ...percent("collapse"), label: "effect-tree.weather" },
  "weather.season-ratio": percent(),
  "weather.severity-ratio": percent(),
  "jobs.farmer.catnip": {
    ...perTick("collapse"),
    label: "effect-tree.farming",
  },
  "jobs.farmer.catnip.base": perTick(),
  "population.catnip-demand": {
    ...perTick("collapse"),
    label: "effect-tree.village-demand",
    invert: true,
  },
  "population.catnip-demand.base": { ...perTick(), invert: true },

  // Wood
  "wood.delta": perTick("inline"),
  "wood.production": perTick("inline"),
  "jobs.woodcutter.wood": {
    ...perTick("collapse"),
    label: "effect-tree.woodcutting",
  },
  "jobs.woodcutter.wood.base": perTick(),

  // Minerals
  "minerals.delta": perTick("inline"),
  "minerals.production": perTick("inline"),
  "jobs.miner.minerals": {
    ...perTick("collapse"),
    label: "effect-tree.mining",
  },
  "jobs.miner.minerals.base": perTick(),
  "minerals.ratio": { ...percent("collapse"), label: "effect-tree.bonus" },
  "mine.minerals-ratio": percent(),
  "mine.minerals-ratio.base": percent(),

  // Science
  "science.delta": perTick("inline"),
  "science.production": perTick("inline"),
  "jobs.scholar.science": {
    ...perTick("collapse"),
    label: "effect-tree.researching",
  },
  "jobs.scholar.science.base": perTick(),
  "science.ratio": { ...percent("collapse"), label: "effect-tree.bonus" },
  "library.science-ratio": percent(),
  "library.science-ratio.base": percent(),

  // Happiness
  "population.happiness.total": percent("inline"),
  "population.happiness.base": { ...percent(), label: "effect-tree.base" },
  "population.unhappiness": percent("inline"),
  "population.overpopulation": {
    ...percent("collapse"),
    label: "effect-tree.overpopulation",
    invert: true,
  },
  "population.overpopulation.base": percent(),
  "population.overpopulation.severity": percent(),

  // Limits
  // Catnip
  "catnip.limit": noUnit("inline"),
  "catnip.limit.base": noUnit(),
  "barn.catnip-limit": noUnit("inline"),
  "barn.catnip-limit.base": noUnit(),

  // Wood
  "wood.limit": noUnit("inline"),
  "wood.limit.base": noUnit(),
  "barn.wood-limit": noUnit("inline"),
  "barn.wood-limit.base": noUnit(),

  // Minerals
  "minerals.limit": noUnit("inline"),
  "minerals.limit.base": noUnit(),
  "barn.minerals-limit": noUnit("inline"),
  "barn.minerals-limit.base": noUnit(),

  // Science
  "science.limit": noUnit("inline"),
  "library.science-limit": noUnit("collapse"),
  "library.science-limit.base": noUnit(),
  "astronomy.rare-event.reward": noUnit(),
  "astronomy.rare-event.reward.base": noUnit(),

  // Kittens
  "kittens.limit": noUnit("inline"),
  "hut.kittens-limit": noUnit("collapse"),
  "hut.kittens-limit.base": noUnit(),
};

function noUnit(disposition?: EffectStyleDisposition): EffectDisplayStyle {
  if (disposition) {
    return { unit: UnitKind.None, disposition };
  } else {
    return { unit: UnitKind.None };
  }
}

function perTick(disposition?: EffectStyleDisposition): EffectDisplayStyle {
  if (disposition) return { unit: UnitKind.PerTick, disposition };
  else return { unit: UnitKind.PerTick };
}

function percent(disposition?: EffectStyleDisposition): EffectDisplayStyle {
  if (disposition) return { unit: UnitKind.Percent, disposition };
  else return { unit: UnitKind.Percent };
}

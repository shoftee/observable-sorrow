import { NumberEffectId } from "@/app/interfaces";

export type EffectState<T> = { value: T | undefined };

export class EffectTreeState extends Map<NumberEffectId, Set<NumberEffectId>> {}

export enum UnitKind {
  None,
  Tick,
  PerTick,
  Percent,
}

export type NumberStyle = Readonly<{
  unit: UnitKind;
  invert?: boolean;
  label?: string;
  disposition?: "none" | "hide" | "inline" | "collapse";
}>;

export const EffectNumberStyleMetadata: Record<NumberEffectId, NumberStyle> = {
  // Deltas
  // Catnip
  "catnip.delta": { unit: UnitKind.PerTick, disposition: "inline" },
  "catnip.production": { unit: UnitKind.PerTick, disposition: "inline" },
  "catnip-field.catnip": {
    unit: UnitKind.PerTick,
    label: "effect-tree.catnip-fields",
    disposition: "collapse",
  },
  "catnip-field.catnip.base": { unit: UnitKind.PerTick },
  "weather.ratio": {
    unit: UnitKind.Percent,
    label: "effect-tree.weather",
    disposition: "collapse",
  },
  "weather.season-ratio": { unit: UnitKind.Percent },
  "weather.severity-ratio": { unit: UnitKind.Percent },
  "jobs.farmer.catnip": {
    unit: UnitKind.PerTick,
    label: "effect-tree.farming",
    disposition: "collapse",
  },
  "jobs.farmer.catnip.base": { unit: UnitKind.PerTick },
  "population.catnip-demand": {
    unit: UnitKind.PerTick,
    invert: true,
    label: "effect-tree.village-demand",
    disposition: "collapse",
  },
  "population.catnip-demand.base": {
    unit: UnitKind.PerTick,
    invert: true,
  },

  // Wood
  "wood.delta": { unit: UnitKind.PerTick, disposition: "inline" },
  "wood.production": { unit: UnitKind.PerTick, disposition: "inline" },
  "jobs.woodcutter.wood": {
    unit: UnitKind.PerTick,
    label: "effect-tree.woodcutting",
    disposition: "collapse",
  },
  "jobs.woodcutter.wood.base": { unit: UnitKind.PerTick },

  // Science
  "science.delta": { unit: UnitKind.PerTick, disposition: "inline" },
  "science.production": { unit: UnitKind.PerTick, disposition: "inline" },
  "jobs.scholar.science": {
    unit: UnitKind.PerTick,
    label: "effect-tree.researching",
    disposition: "collapse",
  },
  "jobs.scholar.science.base": { unit: UnitKind.PerTick },
  "science.ratio": {
    unit: UnitKind.Percent,
    label: "effect-tree.bonus",
    disposition: "collapse",
  },
  "library.science-ratio": { unit: UnitKind.Percent },
  "library.science-ratio.base": { unit: UnitKind.Percent },

  // Limits
  // Catnip
  "catnip.limit": { unit: UnitKind.None, disposition: "inline" },
  "catnip.limit.base": { unit: UnitKind.None },

  // Wood
  "wood.limit": { unit: UnitKind.None, disposition: "inline" },
  "wood.limit.base": { unit: UnitKind.None },

  // Kittens
  "kittens.limit": { unit: UnitKind.None, disposition: "inline" },
  "hut.kittens-limit": { unit: UnitKind.None, disposition: "collapse" },
  "hut.kittens-limit.base": { unit: UnitKind.None },

  // Science
  "science.limit": { unit: UnitKind.None, disposition: "inline" },
  "library.science-limit": { unit: UnitKind.None, disposition: "collapse" },
  "library.science-limit.base": { unit: UnitKind.None },
  "astronomy.rare-event.reward": { unit: UnitKind.None },
  "astronomy.rare-event.reward.base": { unit: UnitKind.None },

  // Catpower
  "catpower.limit": { unit: UnitKind.None, disposition: "inline" },
  "hut.catpower-limit": { unit: UnitKind.None, disposition: "collapse" },
  "hut.catpower-limit.base": { unit: UnitKind.None },

  // Culture
  "culture.limit": { unit: UnitKind.None, disposition: "inline" },
  "library.culture-limit": { unit: UnitKind.None, disposition: "collapse" },
  "library.culture-limit.base": { unit: UnitKind.None },
};

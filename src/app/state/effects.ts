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
  invert: boolean;
}>;

function none(invert?: boolean): NumberStyle {
  return { unit: UnitKind.None, invert: invert === true };
}

function tick(invert?: boolean): NumberStyle {
  return { unit: UnitKind.PerTick, invert: invert === true };
}

function percent(invert?: boolean): NumberStyle {
  return { unit: UnitKind.Percent, invert: invert === true };
}

export const EffectNumberStyleMetadata: Record<NumberEffectId, NumberStyle> = {
  "catnip.delta": tick(),
  "catnip.production": tick(),
  "catnip-field.catnip": tick(),
  "catnip-field.catnip.base": tick(),
  "weather.ratio": percent(),
  "weather.season-ratio": percent(),
  "weather.severity-ratio": percent(),
  "jobs.farmer.catnip": tick(),
  "jobs.farmer.catnip.base": tick(),
  "population.catnip-demand": tick(true),
  "population.catnip-demand.base": tick(true),

  "science.delta": tick(),
  "science.production": tick(),
  "jobs.scholar.science": tick(),
  "jobs.scholar.science.base": tick(),

  "wood.delta": tick(),
  "wood.production": tick(),
  "jobs.woodcutter.wood": tick(),
  "jobs.woodcutter.wood.base": tick(),

  "science.ratio": percent(),
  "library.science-ratio": percent(),
  "library.science-ratio.base": percent(),

  // None
  "catnip.limit": none(),
  "catnip.limit.base": none(),

  "wood.limit": none(),
  "wood.limit.base": none(),

  "kittens.limit": none(),
  "hut.kittens-limit": none(),
  "hut.kittens-limit.base": none(),

  "science.limit": none(),
  "library.science-limit": none(),
  "library.science-limit.base": none(),

  "catpower.limit": none(),
  "hut.catpower-limit": none(),
  "hut.catpower-limit.base": none(),

  "culture.limit": none(),
  "library.culture-limit": none(),
  "library.culture-limit.base": none(),
};

export type EffectTreeMetadataType = {
  label?: string;
  disposition?: "none" | "collapse" | "inline" | "hide";
};

function hide(): EffectTreeMetadataType {
  return { disposition: "hide" };
}

function inline(): EffectTreeMetadataType {
  return { disposition: "inline" };
}

function collapse(label: string): EffectTreeMetadataType {
  return { label: label, disposition: "collapse" };
}

export const EffectTreeMetadata: Record<
  NumberEffectId,
  EffectTreeMetadataType
> = {
  // General change
  "catnip.delta": inline(),
  "science.delta": inline(),
  "wood.delta": inline(),

  // General production
  "catnip.production": inline(),
  "science.production": inline(),
  "wood.production": inline(),

  // Bonuses
  "science.ratio": collapse("effect-tree.bonus"),

  // Weather
  "weather.ratio": collapse("effect-tree.weather"),
  "weather.season-ratio": inline(),
  "weather.severity-ratio": inline(),

  // Limits
  "catnip.limit": hide(),
  "catnip.limit.base": hide(),
  "catpower.limit": hide(),
  "culture.limit": hide(),
  "kittens.limit": hide(),
  "science.limit": hide(),
  "wood.limit": hide(),
  "wood.limit.base": hide(),
  "hut.catpower-limit": hide(),
  "hut.catpower-limit.base": hide(),
  "hut.kittens-limit": hide(),
  "hut.kittens-limit.base": hide(),
  "library.culture-limit": hide(),
  "library.culture-limit.base": hide(),
  "library.science-limit": hide(),
  "library.science-limit.base": hide(),

  // Buildings
  "catnip-field.catnip": { label: "effect-tree.catnip-fields" },
  "catnip-field.catnip.base": hide(),
  "library.science-ratio": { label: "effect-tree.libraries" },
  "library.science-ratio.base": hide(),
  "population.catnip-demand": { label: "effect-tree.village-demand" },
  "population.catnip-demand.base": hide(),

  // Jobs
  "jobs.farmer.catnip": { label: "effect-tree.farming" },
  "jobs.farmer.catnip.base": hide(),
  "jobs.scholar.science": { label: "effect-tree.researching" },
  "jobs.scholar.science.base": hide(),
  "jobs.woodcutter.wood": { label: "effect-tree.woodcutting" },
  "jobs.woodcutter.wood.base": hide(),
};

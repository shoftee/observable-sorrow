export type ResourceId = "catnip" | "wood";

export enum Rarity {
  Common,
  Uncommon,
  Rare,
  Exotic,
}

export enum ResetLogic {
  Chronospheres,
  Disappears,
  KeptAsIs,
}

export enum Flag {
  DestroyedByApocalypse,
  BaseMetal,
  ImprovedByMagneto,
  RelockedWhenDepleted,
}

type Flags = Partial<{ [key in keyof typeof Flag]: boolean }>;

export enum CalculationRate {
  PerTick,
  PerDay,
}

export type ResourceMetadataType = {
  readonly id: ResourceId;
  readonly title: string;
  readonly craftable: boolean;
  readonly calculationRate?: CalculationRate;
  readonly resetLogic: ResetLogic;
  readonly rarity: Rarity;
  readonly flags: Flags;
};

export const ResourceMetadata: Record<ResourceId, ResourceMetadataType> = {
  catnip: {
    id: "catnip",
    title: "resources.catnip.title",
    craftable: false,
    calculationRate: CalculationRate.PerTick,
    resetLogic: ResetLogic.Chronospheres,
    rarity: Rarity.Common,
    flags: { [Flag.DestroyedByApocalypse]: true },
  },
  wood: {
    id: "wood",
    title: "resources.wood.title",
    craftable: true,
    calculationRate: CalculationRate.PerTick,
    resetLogic: ResetLogic.Chronospheres,
    rarity: Rarity.Common,
    flags: {
      [Flag.DestroyedByApocalypse]: true,
      [Flag.ImprovedByMagneto]: true,
    },
  },
};

export type LimitMetadataType = {
  id: ResourceId;
  base: number;
};

export const LimitMetadata: Record<ResourceId, LimitMetadataType> = {
  catnip: { id: "catnip", base: 100 },
  wood: { id: "wood", base: 100 },
  // wood: { id: "wood", base: 200 },
  // minerals: { id: "minerals", base: 250 },
  // coal: { id: "coal", base: 60 },
  // iron: { id: "iron", base: 50 },
  // titanium: { id: "titanium", base: 2 },
  // gold: { id: "gold", base: 10 },
  // oil: { id: "oil", base: 1500 },
  // uranium: { id: "uranium", base: 250 },
  // unobtainium: { id: "unobtainium", base: 150 },
  // antimatter: { id: "antimatter", base: 100 },
  // catpower: { id: "catpower", base: 100 },
  // science: { id: "science", base: 250 },
  // culture: { id: "culture", base: 100 },
  // faith: { id: "faith", base: 100 },
};

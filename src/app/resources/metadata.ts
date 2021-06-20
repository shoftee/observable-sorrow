export type ResourceId = "catnip";

enum Rarity {
  Common,
  Uncommon,
  Rare,
  Exotic,
}

enum ResetLogic {
  Chronospheres,
  Disappears,
  KeptAsIs,
}

enum Flag {
  DestroyedByApocalypse,
  BaseMetal,
  ImprovedByMagneto,
  RelockedWhenDepleted,
}

class Flags {
  flags: { [key in keyof typeof Flag]: boolean } = {
    BaseMetal: false,
    DestroyedByApocalypse: false,
    ImprovedByMagneto: false,
    RelockedWhenDepleted: false,
  };

  constructor(...flags: Flag[]) {
    for (const flag of flags) {
      this.flags[flag] = true;
    }
  }
}

enum Calculation {
  PerTick,
  PerDay,
}

export type ResourceMetadataType = {
  readonly id: ResourceId;
  readonly title: string;
  readonly craftable: boolean;
  readonly calculation?: Calculation;
  readonly resetLogic: ResetLogic;
  readonly rarity: Rarity;
  readonly flags: Flags;
};

export const ResourceMetadata: Record<ResourceId, ResourceMetadataType> = {
  catnip: {
    id: "catnip",
    title: "resources.catnip.title",
    craftable: false,
    calculation: Calculation.PerTick,
    resetLogic: ResetLogic.Chronospheres,
    rarity: Rarity.Common,
    flags: new Flags(Flag.DestroyedByApocalypse),
  },
};

export type LimitMetadataType = {
  id: ResourceId;
  base: number;
};

export const LimitMetadata: Record<ResourceId, LimitMetadataType> = {
  catnip: { id: "catnip", base: 100 },
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

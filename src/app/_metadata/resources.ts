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

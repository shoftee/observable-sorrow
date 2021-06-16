import { LocalizationKey } from "../core/i18n";

type Id = "catnip";

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

interface IMetadata {
  readonly id: Id;
  readonly title: LocalizationKey;
  readonly craftable: boolean;
  readonly calculation?: Calculation;
  readonly resetLogic: ResetLogic;
  readonly rarity: Rarity;
  readonly flags: Flags;
}

const Metadata: Record<Id, IMetadata> = {
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

export { Id as ResourceId, IMetadata as IResourceMetadata, Metadata };

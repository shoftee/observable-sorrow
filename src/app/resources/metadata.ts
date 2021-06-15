import { asEnumerable } from "linq-es2015";
import { IEntityMetadata } from "../core/entity";
import { LocalizationKey } from "../i18n";
import { Id } from "./types";

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

export interface IResourceMetadata extends IEntityMetadata<Id> {
  readonly id: Id;
  readonly title: LocalizationKey;
  readonly craftable: boolean;
  readonly calculation?: Calculation;
  readonly resetLogic: ResetLogic;
  readonly rarity: Rarity;
  readonly flags: Flags;
}

export const Metadata: Record<Id, IResourceMetadata> = {
  catnip: {
    id: "catnip",
    title: "resources.catnip.title",
    craftable: false,
    calculation: Calculation.PerTick,
    resetLogic: ResetLogic.Chronospheres,
    rarity: Rarity.Common,
    flags: new Flags(Flag.DestroyedByApocalypse),
  }
};
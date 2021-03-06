export type SectionUnlockEffectId =
  | "unlock.section.society"
  | "unlock.section.management"
  | "unlock.section.happiness"
  | "unlock.section.science";

export type JobUnlockEffectId =
  | "unlock.job.scholar"
  | "unlock.job.farmer"
  | "unlock.job.hunter"
  | "unlock.job.miner";

export type BuildingUnlockEffectId =
  | "unlock.building.barn"
  | "unlock.building.mine";

export type BooleanEffectId =
  | SectionUnlockEffectId
  | JobUnlockEffectId
  | BuildingUnlockEffectId;

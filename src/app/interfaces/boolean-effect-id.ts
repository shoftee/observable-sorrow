export type SectionUnlockEffectId =
  | "unlock.section.society"
  | "unlock.section.science";

export type JobUnlockEffectId = "unlock.job.scholar" | "unlock.job.farmer";

export type BuildingUnlockEffectId = never;

export type BooleanEffectId = SectionUnlockEffectId | JobUnlockEffectId;

export type SectionUnlockEffectId =
  | "unlock.section.society"
  | "unlock.section.science";

export type JobUnlockEffectId = "unlock.job.scholar";

export type BuildingUnlockEffectId = never;

export type BooleanEffectId = SectionUnlockEffectId | JobUnlockEffectId;

import { SectionId, SectionUnlockEffectId } from "@/app/interfaces";

export type SectionMetadataType = {
  id: SectionId;
  label: string;
  unlockEffect?: SectionUnlockEffectId;
};

export const SectionsMetadata: Record<SectionId, SectionMetadataType> = {
  "bonfire-section": {
    id: "bonfire-section",
    label: "sections.bonfire.label",
  },
  "society-section": {
    id: "society-section",
    label: "sections.society.label",
    unlockEffect: "unlock.section.society",
  },
  "science-section": {
    id: "science-section",
    label: "sections.science.label",
    unlockEffect: "unlock.section.science",
  },
};

export interface SectionState {
  unlocked: boolean;
  label: string;
  alert: string | undefined;
}

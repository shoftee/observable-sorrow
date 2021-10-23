import { SectionId, SectionUnlockEffectId } from "@/app/interfaces";

export type SectionMetadataType = Readonly<{
  id: SectionId;
  label: string;
  unlockEffect?: SectionUnlockEffectId;
}>;

export const SectionsMetadata: Record<SectionId, SectionMetadataType> = {
  bonfire: {
    id: "bonfire",
    label: "sections.bonfire.label",
  },
  society: {
    id: "society",
    label: "sections.society.label",
    unlockEffect: "unlock.section.society",
  },
  science: {
    id: "science",
    label: "sections.science.label",
    unlockEffect: "unlock.section.science",
  },
};

export interface SectionState {
  unlocked: boolean;
  label: string;
  alert: string | undefined;
}

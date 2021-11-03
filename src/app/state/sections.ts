import { SectionId, SectionUnlockEffectId } from "@/app/interfaces";

export type SectionMetadataType = Readonly<{
  id: SectionId;
  parent?: SectionId;
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
  jobs: {
    id: "jobs",
    parent: "society",
    label: "sections.jobs.label",
  },
  management: {
    id: "management",
    parent: "society",
    label: "sections.management.label",
    unlockEffect: "unlock.section.management",
  },
  science: {
    id: "science",
    label: "sections.science.label",
    unlockEffect: "unlock.section.science",
  },
  technologies: {
    id: "technologies",
    parent: "science",
    label: "sections.technologies.label",
  },
};

export interface SectionState {
  unlocked: boolean;
  label: string;
  alert: string | undefined;
}

import { SectionId } from "@/app/interfaces";

export type SectionMetadataType = {
  id: SectionId;
  label: string;
  unlocked?: boolean;
};

export const SectionsMetadata: Record<SectionId, SectionMetadataType> = {
  "bonfire-section": {
    id: "bonfire-section",
    label: "sections.bonfire.label",
    unlocked: true,
  },
  "society-section": {
    id: "society-section",
    label: "sections.society.label",
  },
  "science-section": {
    id: "science-section",
    label: "sections.science.label",
  },
};

export interface SectionState {
  unlocked: boolean;
  label: string;
  alert: string | undefined;
}

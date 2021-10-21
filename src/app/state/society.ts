import { JobEffectId, JobId } from "@/app/interfaces";

export type JobEffectType = Readonly<{
  id: string;
  label: string;
  base: JobEffectId;
  total: JobEffectId;
}>;

export type JobMetadataType = Readonly<{
  id: JobId;
  label: string;
  description: string;
  flavor?: string;
  effects: JobEffectType[];
}>;

export const JobMetadata: Record<JobId, JobMetadataType> = {
  woodcutter: {
    id: "woodcutter",
    label: "jobs.woodcutter.label",
    description: "jobs.woodcutter.description",
    effects: [
      {
        id: "wood",
        label: "jobs.woodcutter.effects.wood",
        base: "jobs.woodcutter.wood.base",
        total: "jobs.woodcutter.wood",
      },
    ],
  },
};

export interface SocietyState {
  stockpile: number;
  unlocked: boolean;
  totalPops: number;
  idlePops: number;
}

export interface PopState {
  job: JobId | undefined;
  name: string;
}

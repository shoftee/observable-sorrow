import { JobEffectId, JobId } from "@/_interfaces";

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

export class SocietyState {
  stockpile = 0;
  unlocked = false;
  totalPops = 0;
  unemployedPops = 0;
}

export class PopState {
  job: JobId | undefined;
}

import { JobEffectId, JobId, JobUnlockEffectId } from "../interfaces";

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
  unlockEffect?: JobUnlockEffectId;
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
  scholar: {
    id: "scholar",
    label: "jobs.scholar.label",
    description: "jobs.scholar.description",
    unlockEffect: "unlock.job.scholar",
    effects: [
      {
        id: "science",
        label: "jobs.scholar.effects.science",
        base: "jobs.scholar.science.base",
        total: "jobs.scholar.science",
      },
    ],
  },
  farmer: {
    id: "farmer",
    label: "jobs.farmer.label",
    description: "jobs.farmer.description",
    unlockEffect: "unlock.job.farmer",
    effects: [
      {
        id: "catnip",
        label: "jobs.farmer.effects.catnip",
        base: "jobs.farmer.catnip.base",
        total: "jobs.farmer.catnip",
      },
    ],
  },
};

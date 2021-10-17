import { JobId } from "@/_interfaces";

export type JobMetadataType = Readonly<{
  id: JobId;
  label: string;
  description: string;
  flavor?: string;
}>;

export const JobMetadata: Record<JobId, JobMetadataType> = {
  woodcutter: {
    id: "woodcutter",
    label: "jobs.woodcutter.label",
    description: "jobs.woodcutter.description",
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

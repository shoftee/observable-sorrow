import { JobId } from "@/app/interfaces";

export interface SocietyState {
  stockpile: number;
  totalPops: number;
  idlePops: number;
  unlockedJobs: Set<JobId>;
}

export interface PopState {
  job: JobId | undefined;
  name: string;
}

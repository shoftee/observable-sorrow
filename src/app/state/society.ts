import { JobId } from "@/app/interfaces";

export interface SocietyState {
  stockpile: number;
  totalPops: number;
  idlePops: number;
}

export interface JobState {
  unlocked: boolean;
}

export interface PopState {
  job: JobId | undefined;
  name: string;
}

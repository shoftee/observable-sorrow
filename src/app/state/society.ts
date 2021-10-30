import { JobId } from "@/app/interfaces";

export interface SocietyState {
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

export interface StockpileState {
  amount: number;
}

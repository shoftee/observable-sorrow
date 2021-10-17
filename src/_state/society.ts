export class SocietyState {
  stockpile = 0;
  unlocked = false;
  totalPops = 0;
  unemployedPops = 0;
}

export type Job = "none" | "woodcutter";

export class PopState {
  job: Job = "none";
}

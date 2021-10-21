import { reactive } from "vue";

import { JobId } from "@/app/interfaces";
import { SocietyState } from "@/app/state";
import { SaveState } from "@/app/store";

import { Entity, Watcher } from ".";

export class SocietyEntity extends Entity<"society"> {
  readonly state: SocietyState;

  constructor() {
    super("society");

    this.state = reactive({
      stockpile: 0,
      totalPops: 0,
      idlePops: 0,
      unlockedJobs: new Set<JobId>(),
    });
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }

  loadState(save: SaveState): void {
    const society = save.society;
    if (society?.stockpile !== undefined) {
      this.state.stockpile = society.stockpile;
    }
  }

  saveState(state: SaveState): void {
    state.society = {
      stockpile: this.state.stockpile,
    };
  }
}

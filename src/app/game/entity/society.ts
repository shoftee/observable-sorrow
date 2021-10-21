import { reactive } from "vue";

import { SocietyState } from "@/app/state/society";

import { Entity, Watcher } from ".";

export class SocietyEntity extends Entity<"society"> {
  readonly state: SocietyState;

  constructor() {
    super("society");

    this.state = reactive({
      stockpile: 0,
      unlocked: false,
      totalPops: 0,
      idlePops: 0,
    });
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }
}

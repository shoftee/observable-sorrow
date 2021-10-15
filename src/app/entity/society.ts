import { reactive } from "vue";

import { SocietyState } from "@/_state/society";

import { Entity, Watcher } from ".";

export class SocietyEntity extends Entity<"society"> {
  readonly state: SocietyState;

  constructor() {
    super("society");

    this.state = reactive(new SocietyState());
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }
}

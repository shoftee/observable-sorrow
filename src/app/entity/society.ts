import { reactive } from "vue";

import { SocietyState } from "@/_state/society";

import { Entity, Watch } from ".";

export class SocietyEntity extends Entity<"society"> {
  readonly state: SocietyState;

  constructor() {
    super("society");

    this.state = reactive(new SocietyState());
  }

  acceptWatcher(watcher: Watch): void {
    watcher(this.id, this.state);
  }
}

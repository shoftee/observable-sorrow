import { reactive } from "vue";

import { PlayerState } from "@/app/state";

import { Entity, Watcher } from ".";

export class PlayerEntity extends Entity<"player"> {
  readonly state: PlayerState;

  constructor() {
    super("player");

    this.state = reactive({
      gatherCatnip: 1,
      timeAcceleration: 1,
    });
  }

  watch(watcher: Watcher): void {
    watcher.watch("player", this.state);
  }
}

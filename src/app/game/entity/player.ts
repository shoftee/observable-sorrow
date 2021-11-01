import { reactive } from "vue";

import { PlayerState } from "@/app/state";
import { SaveState } from "@/app/store";

import { Entity, Persisted, Watched, Watcher } from ".";

export class PlayerEntity
  extends Entity<"player">
  implements Watched, Persisted
{
  readonly state: PlayerState;

  constructor() {
    super("player");

    this.state = reactive({
      dev: false,
      gatherCatnip: 1,
      timeAcceleration: 0,
      slowness: 0,
    });
  }

  watch(watcher: Watcher): void {
    watcher.watch("player", this.state);
  }

  loadState(save: SaveState): void {
    if (save.player !== undefined) {
      if (save.player.dev !== undefined) {
        this.state.dev = true;
        this.state.gatherCatnip = save.player.dev.gatherCatnip;
        this.state.timeAcceleration = save.player.dev.timeAcceleration;
      }
    }
  }

  saveState(save: SaveState): void {
    save.player = {
      dev: this.state.dev ? { ...this.state } : undefined,
    };
  }
}

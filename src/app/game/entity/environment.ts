import { reactive } from "vue";

import { EnvironmentState } from "@/app/state";
import { SaveState } from "@/app/store";

import { Entity, Watcher } from ".";

export class EnvironmentEntity extends Entity<"environment"> {
  readonly state: EnvironmentState;

  constructor() {
    super("environment");

    this.state = reactive({
      year: 0,
      season: "spring",
      day: 0,
      weather: "neutral",
    });
  }

  loadState(state: SaveState): void {
    if (state.environment) {
      Object.assign(this.state, state.environment);
    }
  }

  saveState(state: SaveState): void {
    state.environment = {
      day: this.state.day,
      season: this.state.season,
      year: this.state.year,
      weather: this.state.weather,
    };
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }
}

import { reactive } from "vue";

import { EnvironmentState } from "@/app/state";
import { SaveState } from "@/app/store";

import { Entity, Persisted, Watched, Watcher } from ".";

export class EnvironmentEntity
  extends Entity<"environment">
  implements Watched, Persisted
{
  readonly state: EnvironmentState;

  observedSky: boolean;

  constructor() {
    super("environment");

    this.state = reactive({
      year: 0,
      season: "spring",
      day: 0,
      weather: "neutral",
      calendarLabel: "calendar.basic.no-weather",
      epochLabel: "calendar.epoch.basic",
    });

    this.observedSky = false;
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
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
      weather: this.state.weather,
      year: this.state.year,
    };
  }
}

import { reactive } from "vue";

import { EnvironmentState } from "@/app/state";

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

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }
}

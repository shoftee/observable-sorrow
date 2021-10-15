import { reactive } from "vue";

import { EnvironmentState } from "@/_state";

import { Entity, Watcher } from ".";

export class EnvironmentEntity extends Entity<"environment"> {
  readonly state: EnvironmentState;

  constructor() {
    super("environment");

    this.state = reactive(new EnvironmentState());
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }
}

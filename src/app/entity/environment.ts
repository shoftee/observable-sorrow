import { reactive } from "vue";

import { EnvironmentState } from "@/_state";

import { Entity, Watch } from ".";

export class EnvironmentEntity extends Entity {
  readonly state: EnvironmentState;

  constructor() {
    super("environment");

    this.state = reactive(new EnvironmentState());
  }

  acceptWatcher(watcher: Watch): void {
    watcher(this.id, this.state);
  }
}

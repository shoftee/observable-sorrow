import { Component } from "../ecs";
import { QueueComponent } from "../ecs/common";

import { ResourceQuantityType } from "../core/metadata";

export class BuildingStateComponent extends Component {
  unlocked = false;
  level = 0;
}

export class BuildingPriceComponent extends Component {
  ingredients: ResourceQuantityType[] = [];
}

interface BuildingCommand {
  intent: "construct" | "deconstruct";
}

export class BuildQueueComponent extends QueueComponent<BuildingCommand> {
  construct() {
    this.enqueue({ intent: "construct" });
  }

  deconstruct() {
    this.enqueue({ intent: "deconstruct" });
  }

  consume(callback: (item: BuildingCommand) => void): void {
    super.consume(callback);
  }
}

import { cloneDeep } from "lodash";

import { Component } from "../ecs";
import { QueueComponent } from "../ecs/common";

import {
  BuildingId,
  BuildingMetadata,
  ResourceQuantityType,
} from "../core/metadata";

export class BuildingStateComponent extends Component {
  readonly ingredients: ResourceQuantityType[];
  unlocked = false;
  level = 0;

  constructor(id: BuildingId) {
    super();
    this.ingredients = cloneDeep(BuildingMetadata[id].prices.ingredients);
  }
}

interface BuildingCommand {
  intent: "construct" | "deconstruct";
}

export class BuildQueueComponent extends QueueComponent<BuildingCommand> {
  construct(): void {
    this.enqueue({ intent: "construct" });
  }

  consume(callback: (item: BuildingCommand) => void): void {
    super.consume(callback);
  }
}

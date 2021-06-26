import { Component } from "../ecs";
import { QueueComponent } from "../ecs/common";

import { ProductionEffectType, ResourceQuantityType } from "../core/metadata";

export class BuildingStateComponent extends Component {
  unlocked = false;
  level = 0;
}

export class BuildingPriceComponent extends Component {
  ingredients: ResourceQuantityType[] = [];
}

export class BuildingProductionComponent extends Component {
  effects: ProductionEffectType[] = [];
}

interface BuildingCommand {
  intent: "construct" | "deconstruct";
}

export class BuildQueueComponent extends QueueComponent<BuildingCommand> {
  construct(): void {
    this.enqueue({ intent: "construct" });
  }

  deconstruct(): void {
    this.enqueue({ intent: "deconstruct" });
  }

  consume(callback: (item: BuildingCommand) => void): void {
    super.consume(callback);
  }
}

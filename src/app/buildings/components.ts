import { Component } from "../ecs";
import { QueueComponent } from "../ecs/common";

import { BuildingId, BuildingMetadata, ResourceId } from "../core/metadata";

export class BuildingStateComponent extends Component {
  readonly ingredients: Map<ResourceId, number>;
  unlocked = false;
  level = 0;

  constructor(id: BuildingId) {
    super();
    const meta = BuildingMetadata[id];
    this.ingredients = new Map<ResourceId, number>(
      meta.prices.baseIngredients.map((m) => [m.id, m.amount]),
    );
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

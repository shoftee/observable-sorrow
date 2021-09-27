import { Component } from "../ecs";
import { QueueComponent } from "../ecs/common";

import {
  BuildingId,
  BuildingMetadata,
  EffectId,
  ResourceId,
} from "../core/metadata";

export class BuildingStateComponent extends Component {
  readonly ingredients: Map<ResourceId, number>;
  readonly effects: Map<EffectId, number>;
  unlocked = false;
  level = 0;

  constructor(id: BuildingId) {
    super();
    const meta = BuildingMetadata[id];
    this.ingredients = new Map<ResourceId, number>(
      meta.prices.baseIngredients.map((m) => [m.id, m.amount]),
    );
    this.effects = new Map<EffectId, number>(
      meta.effects.resources.map((m) => [m.per, 0]),
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

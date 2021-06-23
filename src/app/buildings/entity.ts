import { Component, ComponentState, Entity, IUpdate } from "../ecs";
import {
  ChangeNotifierComponent,
  QueueComponent,
  setAndNotify,
} from "../ecs/common";

import { BuildingMetadataType } from "../core/metadata";
import { ResourcePool } from "../resources";

type State = ComponentState<BuildingStateComponent>;
type ChangeNotifier = ChangeNotifierComponent<State>;

export class BuildingEntity extends Entity implements IUpdate {
  readonly buildQueue: BuildQueueComponent;
  readonly state: BuildingStateComponent;
  readonly changes: ChangeNotifier;

  constructor(
    private readonly resources: ResourcePool,
    private readonly metadata: BuildingMetadataType,
  ) {
    super();
    this.buildQueue = this.addComponent(new BuildQueueComponent());
    this.state = this.addComponent(new BuildingStateComponent());
    this.changes = this.addComponent(new ChangeNotifierComponent());
  }

  update(_dt: number): void {
    if (!this.state.unlocked) {
      this.updateUnlocked();
    }
    this.buildQueue.consume((item) => {
      if (item.intent == "construct") {
        const newLevel = this.state.level + 1;
        setAndNotify(this.state, this.changes, "level", newLevel);
      } else {
        throw new Error("Only constructing building is supported for now.");
      }
    });
  }

  private updateUnlocked() {
    for (const requirement of this.metadata.ingredients) {
      const resource = this.resources.get(requirement.id);
      const amount = resource.state.amount;
      if (amount >= requirement.amount * this.metadata.unlockRatio) {
        setAndNotify(this.state, this.changes, "unlocked", true);
      }
    }
  }
}

class BuildingStateComponent extends Component {
  unlocked = false;
  level = 0;
}

interface BuildingCommand {
  intent: "construct" | "deconstruct";
}

class BuildQueueComponent extends QueueComponent<BuildingCommand> {
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

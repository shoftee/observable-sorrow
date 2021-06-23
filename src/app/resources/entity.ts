import { ComponentState, Entity } from "../ecs";
import { ChangeNotifierComponent, setAndNotify } from "../ecs/common";
import { ResourceStateComponent, MutationComponent } from "./components";
import {
  Flag,
  ResourceId,
  ResourceMetadataType,
} from "../core/metadata/resources";

type State = ComponentState<ResourceStateComponent>;
type ChangeNotifier = ChangeNotifierComponent<State>;

export class ResourceEntity extends Entity {
  private readonly metadata: ResourceMetadataType;

  readonly id: ResourceId;
  readonly mutations: MutationComponent;
  readonly state: ResourceStateComponent;
  readonly changes: ChangeNotifier;

  constructor(metadata: ResourceMetadataType) {
    super();

    this.metadata = metadata;

    this.id = metadata.id;
    this.mutations = this.addComponent(new MutationComponent());
    this.state = this.addComponent(new ResourceStateComponent());
    this.changes = this.addComponent(new ChangeNotifierComponent());
  }

  update(_dt: number): void {
    this.updateAmount();
    this.updateUnlocked();
  }

  private updateAmount() {
    const current = this.state.amount;
    const capacity = Number.POSITIVE_INFINITY; // finish later

    // calculate delta from mutations
    const delta = this.mutations.sum();

    // determine new value, truncate
    let newValue = current + delta;
    newValue = Math.max(newValue, 0);
    newValue = Math.min(newValue, capacity);

    // set and notify
    setAndNotify(this.state, this.changes, "amount", newValue);
  }

  private updateUnlocked() {
    if (this.state.amount > 0) {
      // all resources unlock once they reach positive amounts
      setAndNotify(this.state, this.changes, "unlocked", true);
    } else {
      // some resources re-lock when they are depleted
      if (this.metadata.flags[Flag.RelockedWhenDepleted]) {
        setAndNotify(this.state, this.changes, "unlocked", false);
      }
    }
  }
}

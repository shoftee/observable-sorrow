import { ComponentState, Entity } from "../ecs";
import { AmountComponent, MutationComponent } from "./amount";
import { Flag, ResourceId, ResourceMetadataType } from "./metadata";

export type AmountState = ComponentState<AmountComponent>;

export class ResourceEntity extends Entity {
  private readonly metadata: ResourceMetadataType;

  readonly id: ResourceId;
  readonly mutations: MutationComponent;
  readonly amount: AmountComponent;

  private _changed = false;
  get changed() {
    return this._changed;
  }

  constructor(metadata: ResourceMetadataType) {
    super();

    this.metadata = metadata;

    this.id = metadata.id;
    this.mutations = this.addComponent(new MutationComponent());
    this.amount = this.addComponent(new AmountComponent());
  }

  update(_deltaTime: number): void {
    this._changed = false;

    const amount = this.amount;

    const delta = this.calculateDelta(amount.value, this.mutations);
    if (delta != 0) {
      amount.value += delta;
      this._changed = true;
    }

    if (amount.value > 0) {
      // all resources unlock once they reach positive amounts
      if (!amount.unlocked) {
        amount.unlocked = true;
        this._changed = true;
      }
    } else {
      // some resources re-lock when they are depleted
      if (amount.unlocked && this.metadata.flags[Flag.RelockedWhenDepleted]) {
        amount.unlocked = false;
        this._changed = true;
      }
    }
  }

  private calculateDelta(
    current: number,
    mutations: MutationComponent,
    capacity?: number,
  ) {
    const change = mutations.sum();
    let newValue = current + change;

    // No negative values. For now.
    newValue = Math.max(newValue, 0);

    // No values past infinity. For now.
    newValue = Math.min(newValue, capacity ?? Number.POSITIVE_INFINITY);

    return newValue - current;
  }
}

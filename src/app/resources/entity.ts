import { Ref, unref } from "vue";
import { ComponentState, Entity } from "../ecs";
import { AmountComponent } from "./amount";
import { Flag, ResourceId, ResourceMetadataType } from "./metadata";

export type AmountState = ComponentState<AmountComponent>;

export class ResourceEntity extends Entity {
  readonly id: ResourceId;
  private readonly metadata: ResourceMetadataType;

  amount!: AmountComponent;

  constructor(metadata: ResourceMetadataType) {
    super();
    this.id = metadata.id;

    this.metadata = metadata;
  }

  init(): void {
    this.amount = this.addComponent(new AmountComponent());
  }

  update(_deltaTime: number): void {
    this.updateAmount(unref(this.amount));
  }

  updateAmount(amount: AmountComponent): void {
    if (amount.value > 0) {
      // all resources unlock once they reach positive amounts
      if (!amount.unlocked) {
        amount.unlocked = true;
      }
    } else {
      // some resources re-lock when they are depleted
      if (amount.unlocked && this.metadata.flags[Flag.RelockedWhenDepleted]) {
        amount.unlocked = false;
      }
    }
  }
}

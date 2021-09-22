import { ResourceId } from "../core/metadata";
import { System } from "../ecs";
import { ResourceEntity } from "../resources/entity";

export interface ITransactionSystem {
  giveResource(id: ResourceId, amount: number): void;
}

export class TransactionSystem extends System implements ITransactionSystem {
  giveResource(id: ResourceId, amount: number): void {
    this.admin.resource(id).mutations.give(amount);
  }

  update(): void {
    for (const resource of this.admin.resources()) {
      this.updateAmount(resource);
    }
  }

  private updateAmount(resource: ResourceEntity): boolean {
    const currentValue = resource.state.amount;
    const capacity = resource.state.capacity ?? Number.POSITIVE_INFINITY;

    // calculate delta from mutations
    const delta = resource.mutations.sum();

    // determine new value, truncate
    let newValue = currentValue + delta;
    newValue = Math.max(newValue, 0);
    newValue = Math.min(newValue, capacity);

    // set and notify
    if (newValue != currentValue) {
      resource.state.amount = newValue;
      return true;
    }

    return false;
  }
}

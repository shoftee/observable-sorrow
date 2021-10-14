import { ResourceDelta, ResourceState } from "@/_state";

import { EntityAdmin } from "../entity";

import { System } from ".";

export class ResourceProductionSystem extends System {
  constructor(admin: EntityAdmin) {
    super(admin);
  }

  init(): void {
    this.updateDeltas();
  }

  update(): void {
    this.updateDeltas();

    const dt = this.admin.time().ticks.delta;
    for (const resource of this.admin.resources()) {
      if (resource.state.change) {
        // calculate new amounts based on fractional ticks
        const change = dt * resource.state.change;

        if (change > 0) {
          resource.delta.addDebit(change);
        } else if (change < 0) {
          // change is negative, add absolute value as credit
          resource.delta.addCredit(Math.abs(change));
        }
      }

      this.updateAmount(resource.state, resource.delta);
    }
  }

  private updateDeltas() {
    for (const resource of this.admin.resources()) {
      const meta = resource.meta;

      const deltaEffect = meta.effects.delta;
      if (deltaEffect) {
        resource.state.change = this.admin.effect(deltaEffect).get() ?? 0;
      }
    }
  }

  private updateAmount(state: ResourceState, delta: ResourceDelta): void {
    const newValue = this.calculateAmount(
      state.amount,
      state.capacity,
      delta.debit,
      delta.credit,
    );

    // set newly calculated value
    state.amount = newValue;

    // clear delta
    delta.reset();
  }

  private calculateAmount(
    currentValue: number,
    capacity: number | undefined,
    debit: number,
    credit: number,
  ): number {
    // Assume capacity is infinite when undefined
    capacity = capacity ?? Number.POSITIVE_INFINITY;

    // subtract losses first
    let newValue = currentValue - credit;
    if (newValue < capacity) {
      // new resources are gained only when under capacity
      newValue = newValue + debit;

      // but they only go up to capacity at most
      newValue = Math.min(newValue, capacity);
    }

    // negative resource amount is non-sense (for now)
    newValue = Math.max(newValue, 0);

    // return calculated value
    return newValue;
  }
}

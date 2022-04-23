import { watchSyncEffect } from "vue";

import { EntityAdmin } from "../entity";

import { System } from ".";

export class ResourceAmountsSystem extends System {
  constructor(admin: EntityAdmin) {
    super(admin);
  }

  init(): void {
    watchSyncEffect(() => {
      for (const { meta, state } of this.admin.resources()) {
        const deltaEffect = meta.effects.delta;
        if (deltaEffect) {
          state.change = this.admin.number(deltaEffect).getOr(0);
        }
      }
    });
  }

  update(): void {
    const dt = this.admin.time().ticks.delta;
    for (const { state, delta } of this.admin.resources()) {
      const change = dt * state.change;
      if (change > 0) {
        // change is positive, add value as debit
        delta.addDebit(change);
      } else if (change < 0) {
        // change is negative, add absolute value as credit
        delta.addCredit(Math.abs(change));
      }

      state.amount = this.calculateAmount(
        state.amount,
        // Assume capacity is infinite when undefined
        state.capacity ?? Number.POSITIVE_INFINITY,
        delta.debit,
        delta.credit,
      );

      // clear delta
      delta.reset();
    }
  }

  private calculateAmount(
    currentValue: number,
    capacity: number,
    debit: number,
    credit: number,
  ): number {
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

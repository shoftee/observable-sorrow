import { Ref, unref } from "vue";
import { IMutation } from "../core/mutation";
import { ResourceState as State } from "./state";

class ChangeAmountMutation implements IMutation {
  readonly entity: Ref<State>;
  readonly intended: number;
  actual?: number;

  constructor(entity: Ref<State>, intended: number) {
    this.entity = entity;
    this.intended = intended;
  }

  apply(): void {
    const intended = this.intended;
    if (intended != 0) {
      this.actual = this.changeAmount(unref(this.entity), this.intended);
    }
  }

  undo(): void {
    const actual = this.actual ?? 0;
    if (actual != 0) {
      this.changeAmount(unref(this.entity), -actual);
      this.actual = undefined;
    }
  }

  private changeAmount(entity: State, change: number): number {
    const currentValue = entity.amount;
    const newValue = this.boundedChange(currentValue, change, entity.capacity);

    entity.amount = newValue;
    return newValue - currentValue;
  }

  private boundedChange(current: number, change: number, capacity?: number) {
    let newValue = current + change;

    // No negative values. For now.
    newValue = Math.max(newValue, 0);

    // No values past infinity. For now.
    newValue = Math.min(newValue, capacity ?? Number.POSITIVE_INFINITY);

    return newValue;
  }
}

export { ChangeAmountMutation };

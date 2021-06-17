import { Ref, unref } from "vue";
import { IMutation } from "../../game/mutation";
import { IResourceState as IState } from "../../entities/resource";

class ChangeAmountMutation implements IMutation {
  readonly entity: Ref<IState>;
  readonly intended: number;
  actual?: number;

  constructor(entity: Ref<IState>, intended: number) {
    this.entity = entity;
    this.intended = intended;
  }

  apply(): void {
    const intended = this.intended;
    if (intended != 0) {
      this.actual = this.changeAmount(unref(this.entity), this.intended);
    }
  }

  private changeAmount(entity: IState, change: number): number {
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

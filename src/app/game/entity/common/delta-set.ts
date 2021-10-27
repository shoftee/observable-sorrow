import { ResourceId } from "@/app/interfaces";
import { getOrAdd } from "@/app/utils/collections";

import { ResourceDelta, Delta } from "..";

export class DeltaSet {
  private readonly map = new Map<ResourceId, ResourceDelta>();

  constructor(private readonly base?: DeltaSet | undefined) {}

  getDebit(id: ResourceId, shallow: boolean = false): number {
    const local = this.ensure(id).debit;
    if (!shallow) {
      return local + (this.base?.getDebit(id) ?? 0);
    }
    return local;
  }

  getCredit(id: ResourceId, shallow: boolean = false): number {
    const local = this.ensure(id).credit;
    if (!shallow) {
      return local + (this.base?.getCredit(id) ?? 0);
    }
    return local;
  }

  addDebit(id: ResourceId, amount: number): void {
    this.ensure(id).addDebit(amount);
  }

  addCredit(id: ResourceId, amount: number): void {
    this.ensure(id).addCredit(amount);
  }

  *deltas(): IterableIterator<[ResourceId, Delta]> {
    for (const key of this.map.keys()) {
      const debit = this.getDebit(key, true);
      const credit = this.getCredit(key, true);
      yield [key, { debit: debit, credit: credit }];
    }
  }

  addDelta(key: ResourceId, delta: ResourceDelta): void {
    const existing = this.ensure(key);
    existing.addDebit(delta.debit);
    existing.addCredit(delta.credit);
  }

  merge(clear: boolean = true): void {
    if (!this.base) {
      throw new Error("cannot merge delta set with no base set");
    }

    for (const [id, delta] of this.map.entries()) {
      this.base.addDelta(id, delta);
      delta.reset();
    }

    if (clear) {
      this.clear();
    }
  }

  clear(): void {
    this.map.clear();
  }

  private ensure(key: ResourceId): ResourceDelta {
    return getOrAdd(this.map, key, () => new ResourceDelta());
  }
}

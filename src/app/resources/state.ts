import { ResourceId } from "@/_interfaces";

export type Delta = {
  readonly debit: number;
  readonly credit: number;
};

export class ResourceDelta {
  private _credit = 0;
  private _debit = 0;

  constructor(other?: ResourceDelta | undefined) {
    if (other) {
      this._credit = other._credit;
      this._debit = other._debit;
    }
  }

  get debit(): number {
    return this._debit;
  }

  get credit(): number {
    return this._credit;
  }

  addDebit(n: number): void {
    this._debit += n;
  }

  addCredit(n: number): void {
    this._credit += n;
  }

  addDelta(other: Delta): void {
    this._debit += other.debit;
    this._credit += other.credit;
  }

  reset(): void {
    this._debit = 0;
    this._credit = 0;
  }
}

export class DeltaSet {
  private readonly map = new Map<ResourceId, ResourceDelta>();

  constructor(private readonly base?: DeltaSet | undefined) {}

  getDebit(id: ResourceId, shallow: boolean = false): number {
    const local = this.delta(id).debit;
    if (!shallow) {
      return local + (this.base?.getDebit(id) ?? 0);
    }
    return local;
  }

  getCredit(id: ResourceId, shallow: boolean = false): number {
    const local = this.delta(id).credit;
    if (!shallow) {
      return local + (this.base?.getCredit(id) ?? 0);
    }
    return local;
  }

  addDebit(id: ResourceId, amount: number): void {
    this.delta(id).addDebit(amount);
  }

  addCredit(id: ResourceId, amount: number): void {
    this.delta(id).addCredit(amount);
  }

  *deltas(): IterableIterator<[ResourceId, Delta]> {
    for (const key of this.map.keys()) {
      const debit = this.getDebit(key, true);
      const credit = this.getCredit(key, true);
      yield [key, { debit: debit, credit: credit }];
    }
  }

  addDelta(key: ResourceId, delta: ResourceDelta): void {
    const existing = this.delta(key);
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

  private delta(key: ResourceId): ResourceDelta {
    let value = this.map.get(key);
    if (!value) {
      value = new ResourceDelta();
      this.map.set(key, value);
    }
    return value;
  }
}

import { ResourceId } from "@/app/interfaces";
import { getOrAdd } from "@/app/utils/collections";

export type ReadonlyLedgerEntry = Readonly<{ debit: number; credit: number }>;

export class LedgerEntry {
  private _credit = 0;
  private _debit = 0;

  constructor(other?: LedgerEntry | undefined) {
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
    if (n < 0) {
      throw new Error("the specified value must be non-negative");
    }
    this._debit += n;
  }

  addCredit(n: number): void {
    if (n < 0) {
      throw new Error("the specified value must be non-negative");
    }
    this._credit += n;
  }

  add(other: ReadonlyLedgerEntry): void {
    this.addDebit(other.debit);
    this.addCredit(other.credit);
  }

  reset(): void {
    this._debit = 0;
    this._credit = 0;
  }
}

export class Ledger {
  private readonly map = new Map<ResourceId, LedgerEntry>();

  constructor(private readonly base?: Ledger | undefined) {}

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

  *entries(): IterableIterator<[ResourceId, ReadonlyLedgerEntry]> {
    for (const key of this.map.keys()) {
      const debit = this.getDebit(key, true);
      const credit = this.getCredit(key, true);
      yield [key, { debit: debit, credit: credit }];
    }
  }

  add(key: ResourceId, stockpile: ReadonlyLedgerEntry): void {
    const existing = this.ensure(key);
    existing.addDebit(stockpile.debit);
    existing.addCredit(stockpile.credit);
  }

  /** Applies all entries in the ledger onto the base and resets them. */
  rebase(): void {
    if (!this.base) {
      throw new Error("base ledger not specified");
    }

    for (const [id, entry] of this.map.entries()) {
      this.base.add(id, entry);
      entry.reset();
    }

    this.clear();
  }

  clear(): void {
    this.map.clear();
  }

  private ensure(key: ResourceId): LedgerEntry {
    return getOrAdd(this.map, key, () => new LedgerEntry());
  }
}

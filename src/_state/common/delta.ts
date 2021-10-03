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

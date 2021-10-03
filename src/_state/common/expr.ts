import { EffectId } from "@/_interfaces";

export interface EffectValueStore {
  get(id: EffectId): number | undefined;
}

export interface Expr {
  deps(): IterableIterator<EffectId>;
  resolve(store: EffectValueStore): number;
}

class ConstExpr implements Expr {
  constructor(readonly constant: number) {}

  deps(): IterableIterator<EffectId> {
    return [].values();
  }

  resolve(_: EffectValueStore): number {
    return this.constant;
  }
}

class SumExpr implements Expr {
  readonly operands: EffectId[];
  constructor(...operands: EffectId[]) {
    this.operands = operands;
  }

  deps(): IterableIterator<EffectId> {
    return this.operands.values();
  }

  resolve(store: EffectValueStore): number {
    return this.operands
      .map((id) => store.get(id) ?? 0)
      .reduce((acc, v) => acc + v, 0);
  }
}

class RatioExpr implements Expr {
  constructor(readonly base: EffectId, readonly ratio: EffectId) {}

  *deps(): IterableIterator<EffectId> {
    yield this.base;
    yield this.ratio;
  }

  resolve(store: EffectValueStore): number {
    const base = store.get(this.base) ?? 0;
    const ratio = store.get(this.ratio) ?? 0;
    return base * (1 + ratio);
  }
}

class ProductExpr implements Expr {
  readonly operands: EffectId[];
  constructor(...operands: EffectId[]) {
    this.operands = operands;
  }

  deps(): IterableIterator<EffectId> {
    return this.operands.values();
  }

  resolve(store: EffectValueStore): number {
    return this.operands
      .map((id) => store.get(id) ?? 0)
      .reduce((acc, v) => acc * v, 1);
  }
}

export function constant(constant: number): Expr {
  return new ConstExpr(constant);
}

export function sum(...operands: EffectId[]): Expr {
  return new SumExpr(...operands);
}

export function ratio(base: EffectId, ratio: EffectId): Expr {
  return new RatioExpr(base, ratio);
}

export function product(...operands: EffectId[]): Expr {
  return new ProductExpr(...operands);
}

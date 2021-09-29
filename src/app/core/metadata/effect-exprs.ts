import { EffectId } from "../../../_interfaces/id";

export type EffectQuantityType = {
  id: EffectId;
  amount: number;
};

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

function constant(constant: number): Expr {
  return new ConstExpr(constant);
}

function sum(...operands: EffectId[]): Expr {
  return new SumExpr(...operands);
}

function ratio(base: EffectId, ratio: EffectId): Expr {
  return new RatioExpr(base, ratio);
}

function product(...operands: EffectId[]): Expr {
  return new ProductExpr(...operands);
}

export const EffectExpressions: Partial<Record<EffectId, Expr>> = {
  // Base limits
  "catnip-limit-base": constant(5000),
  "wood-limit-base": constant(200),

  // Calculated limits
  "catnip-limit": sum("catnip-limit-base"),
  "wood-limit": sum("wood-limit-base"),

  // Production
  "catnip-production": ratio("catnip-field-production", "catnip-field-weather"),

  // Catnip field effects
  "catnip-field-production": product(
    "catnip-field-base-catnip",
    "catnip-field-count",
  ),
  "catnip-field-base-catnip": constant(0.125),
  "catnip-field-weather": sum(
    "weather-season-modifier",
    "weather-severity-modifier",
  ),
};

import { EffectId } from "../_interfaces/id";

import { ExprValueStore, Expr } from ".";
import { reduce } from "@/_utils/collections";

export abstract class EffectExpr implements Expr {
  constructor(readonly id: EffectId) {}
  abstract deps(): IterableIterator<Expr>;
  abstract resolve(store: ExprValueStore): void;
}

class VariableExpr extends EffectExpr {
  constructor(id: EffectId, readonly defaultValue: number = 0) {
    super(id);
  }

  deps(): IterableIterator<Expr> {
    return [].values();
  }

  resolve(store: ExprValueStore): void {
    if (store.get(this.id) === undefined) {
      store.set(this.id, this.defaultValue);
    }
  }
}

class ConstExpr extends EffectExpr {
  constructor(id: EffectId, readonly constant: number) {
    super(id);
  }

  deps(): IterableIterator<Expr> {
    return [].values();
  }

  resolve(store: ExprValueStore): void {
    if (store.get(this.id) === undefined) {
      store.set(this.id, this.constant);
    }
  }
}

class SumExpr extends EffectExpr {
  readonly operands: Expr[];
  constructor(id: EffectId, operands: Expr[]) {
    super(id);
    this.operands = operands;
  }

  deps(): IterableIterator<Expr> {
    return this.operands.values();
  }

  resolve(store: ExprValueStore): void {
    store.set(
      this.id,
      reduce(
        this.operands.values(),
        (expr: Expr) => store.get(expr.id) ?? 0,
        (acc, val) => acc + val,
        0,
      ),
    );
  }
}

class RatioExpr extends EffectExpr {
  constructor(id: EffectId, readonly base: Expr, readonly ratio: Expr) {
    super(id);
  }

  *deps(): IterableIterator<Expr> {
    yield this.base;
    yield this.ratio;
  }

  resolve(store: ExprValueStore): void {
    const base = store.get(this.base.id) ?? 0;
    const ratio = store.get(this.ratio.id) ?? 0;
    store.set(this.id, base * (1 + ratio));
  }
}

class ProductExpr extends EffectExpr {
  readonly operands: Expr[];
  constructor(id: EffectId, operands: Expr[]) {
    super(id);
    this.operands = operands;
  }

  deps(): IterableIterator<Expr> {
    return this.operands.values();
  }

  resolve(store: ExprValueStore): void {
    store.set(
      this.id,
      reduce(
        this.operands.values(),
        (expr: Expr) => store.get(expr.id) ?? 0,
        (acc, val) => acc * val,
        1,
      ),
    );
  }
}

export function constant(id: EffectId, constant: number): EffectExpr {
  return new ConstExpr(id, constant);
}

export function variable(id: EffectId, defaultValue: number = 0): EffectExpr {
  return new VariableExpr(id, defaultValue);
}

export function sum(id: EffectId, operands: Expr[]): EffectExpr {
  return new SumExpr(id, operands);
}

export function ratio(id: EffectId, base: Expr, ratio: Expr): EffectExpr {
  return new RatioExpr(id, base, ratio);
}

export function product(id: EffectId, operands: Expr[]): EffectExpr {
  return new ProductExpr(id, operands);
}

export const EffectExpressions: EffectExpr[] = [
  // Limits
  sum("catnip.limit", [constant("catnip.limit.base", 5000)]),
  sum("wood.limit", [constant("wood.limit.base", 200)]),

  // Catnip Production
  ratio(
    "catnip.production",
    product("catnip-field.production.catnip", [
      constant("catnip-field.production.catnip.base", 0.125),
      variable("catnip-field.count"),
    ]),
    sum("catnip-field.weather", [
      variable("weather.modifier.season"),
      variable("weather.modifier.severity"),
    ]),
  ),
  variable("wood.production"),
];

export function EffectIds(): Set<string> {
  const set = new Set<string>();
  function collect(deps: Iterable<Expr>) {
    for (const dep of deps) {
      set.add(dep.id);
      collect(dep.deps());
    }
  }

  collect(EffectExpressions);
  return set;
}

export interface ExprValueStore {
  get(id: string): number | undefined;
  set(id: string, val: number | undefined): void;
}

export interface Expr {
  readonly id: string;
  deps(): IterableIterator<Expr>;
  resolve(store: ExprValueStore): void;
}

export class Resolver {
  private readonly resolved: Set<string> = new Set<string>();

  resolveExprs(store: ExprValueStore, exprs: Iterable<Expr>): void {
    this.resolved.clear();
    for (const expr of exprs) {
      this.resolveExpr(store, expr);
    }
  }

  private resolveExpr(store: ExprValueStore, expr: Expr) {
    if (this.resolved.has(expr.id)) {
      return;
    }

    for (const dep of expr.deps()) {
      this.resolveExpr(store, dep);
    }

    expr.resolve(store);
    this.resolved.add(expr.id);
  }
}

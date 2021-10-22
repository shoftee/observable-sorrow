import { EntityAdmin, Expr } from "../entity";

import { System } from ".";

export class EffectsSystem extends System {
  constructor(admin: EntityAdmin) {
    super(admin);
  }

  init(): void {
    this.resolveEffectValues();
  }

  update(): void {
    this.resolveEffectValues();
  }

  private resolveEffectValues() {
    const resolver = new Resolver(this.admin);
    resolver.resolveExprs(this.admin.numbers(), {
      get: (id) => this.admin.number(id),
    });
    resolver.resolveExprs(this.admin.booleans(), {
      get: (id) => this.admin.boolean(id),
    });
  }
}

type EffectEntity<T, Id extends string> = {
  id: Id;
  readonly expr: Expr<T, Id>;
  readonly state: {
    value: T | undefined;
  };
};

interface EntityStore<T, TId extends string> {
  get(id: TId): EffectEntity<T, TId>;
}

class Resolver {
  private readonly resolved: Set<string> = new Set<string>();
  private readonly resolving: Set<string> = new Set<string>();

  constructor(private readonly admin: EntityAdmin) {}

  resolveExprs<T, Id extends string>(
    effects: Iterable<EffectEntity<T, Id>>,
    store: EntityStore<T, Id>,
  ): void {
    this.resolved.clear();
    this.resolving.clear();
    for (const effect of effects) {
      this.resolveExpr(effect, store);
    }
  }

  private resolveExpr<T, Id extends string>(
    entity: EffectEntity<T, Id>,
    store: EntityStore<T, Id>,
  ) {
    const id = entity.id;
    if (this.resolved.has(id)) {
      return;
    }

    if (this.resolving.has(id)) {
      console.log(this.resolving);
      throw new CouldNotResolveEffectError(id, "cycle detected");
    }

    // Add current calculation to resolving stack.
    // This allows us to detect cycles.
    this.resolving.add(id);
    const calculatedValue = this.unwrap(entity.expr, store);
    this.resolving.delete(id);

    store.get(id).state.value = calculatedValue;
    this.resolved.add(id);
  }

  private unwrap<T, Id extends string>(
    expr: Expr<T, Id>,
    store: EntityStore<T, Id>,
  ): T {
    if (expr instanceof Function) {
      return expr({
        admin: this.admin,
        val: (id) => {
          const entity = store.get(id);
          this.resolveExpr(entity, store);
          const value = entity.state.value;
          if (value === undefined) {
            throw new CouldNotResolveEffectError(id, "value not in store");
          }
          return value;
        },
      });
    } else {
      return expr;
    }
  }
}

class CouldNotResolveEffectError extends Error {
  constructor(readonly id: string, readonly reason: string) {
    super(`could not resolve value for effect '${id}': ${reason}`);
  }
}

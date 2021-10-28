import { watchSyncEffect } from "vue";

import { NumberEffectId } from "@/app/interfaces";
import { EffectState } from "@/app/state";
import { getOrAdd } from "@/app/utils/collections";

import { System } from ".";
import { BooleanExprs, EntityAdmin, Expr, NumberExprs } from "../entity";

export class EffectsSystem extends System {
  constructor(admin: EntityAdmin) {
    super(admin);
  }

  init(): void {
    watchSyncEffect(() => this.resolveEffectValues());
  }

  update(): void {
    return;
  }

  private resolveEffectValues() {
    const resolver = new Resolver(this.admin);
    resolver.resolveExprs(
      this.admin.numbers().map((m) => m.id),
      {
        expr: (id) => NumberExprs[id],
        state: (id) => this.admin.number(id).state,
        addTreeNode: (parent, child) => {
          getOrAdd(
            this.admin.effectTree().state,
            parent,
            () => new Set<NumberEffectId>(),
          ).add(child);
        },
      },
    );
    resolver.resolveExprs(
      this.admin.booleans().map((m) => m.id),
      {
        expr: (id) => BooleanExprs[id],
        state: (id) => this.admin.boolean(id).state,
      },
    );
  }
}

interface EffectStore<T, TId extends string> {
  expr(id: TId): Expr<T, TId>;
  state(id: TId): EffectState<T>;
  addTreeNode?(parent: TId, child: TId): void;
}

class Resolver {
  private readonly resolved: Set<string> = new Set<string>();
  private readonly resolving: Set<string> = new Set<string>();

  constructor(private readonly admin: EntityAdmin) {}

  resolveExprs<T, Id extends string>(
    effects: Iterable<Id>,
    store: EffectStore<T, Id>,
  ): void {
    this.resolved.clear();
    this.resolving.clear();
    for (const effect of effects) {
      this.resolveExpr(effect, store);
    }
  }

  private resolveExpr<T, Id extends string>(id: Id, store: EffectStore<T, Id>) {
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
    const calculatedValue = this.unwrap(id, store);
    this.resolving.delete(id);

    store.state(id).value = calculatedValue;
    this.resolved.add(id);
  }

  private unwrap<T, Id extends string>(id: Id, store: EffectStore<T, Id>): T {
    const expr = store.expr(id);
    if (expr instanceof Function) {
      return expr({
        admin: this.admin,
        val: (innerId) => {
          this.resolveExpr(innerId, store);
          store.addTreeNode?.(id, innerId);

          const value = store.state(innerId).value;
          if (value === undefined) {
            throw new CouldNotResolveEffectError(innerId, "value not in store");
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

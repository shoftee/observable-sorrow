import { EffectId } from "@/_interfaces";

import { System } from ".";
import { EffectEntity, EntityAdmin, Expr } from "../entity";

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
    resolver.resolveExprs();
  }
}

class Resolver {
  private readonly resolved: Set<string> = new Set<string>();
  private readonly resolving: Set<string> = new Set<string>();

  private readonly store: ExprValueStore;

  constructor(private readonly admin: EntityAdmin) {
    this.store = {
      get: (id: string) => {
        return this.admin.effect(id as EffectId)?.get();
      },
      set: (id: string, val: number) => {
        this.admin.effect(id as EffectId)?.set(val);
      },
    };
  }

  resolveExprs(): void {
    this.resolved.clear();
    this.resolving.clear();
    for (const effect of this.admin.effects()) {
      this.resolveExpr(effect);
    }
  }

  private resolveExpr(effect: EffectEntity) {
    const id = effect.id;
    if (this.resolved.has(id)) {
      return;
    }

    if (this.resolving.has(id)) {
      console.error("detected cycle during calculation", this.resolving);
      throw new Error(
        `Could not calculate value for effect '${id}', please check error log.`,
      );
    }

    // Add current calculation to resolving stack.
    // This allows us to detect cycles.
    this.resolving.add(id);
    const calculatedValue = this.unwrap(effect.expr);
    this.resolving.delete(id);

    this.store.set(id, calculatedValue);
    this.resolved.add(id);
  }

  private unwrap(resolver: Expr): number {
    if (typeof resolver === "number") {
      return resolver;
    } else {
      return resolver({
        admin: this.admin,
        val: (id) => {
          this.resolveExpr(this.admin.effect(id));
          const value = this.store.get(id);
          if (value === undefined) {
            console.error(`value for effect ${id} is not present in store`);
            throw new Error(
              `Could not resolve value for effect '${id}', please check error log.`,
            );
          }
          return value;
        },
      });
    }
  }
}

export interface ExprValueStore {
  get(id: string): number | undefined;
  set(id: string, val: number): void;
}

import { NumberEffectId } from "@/app/interfaces";

import { NumberEffectEntity, EntityAdmin, NumberExpr } from "../entity";

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
    resolver.resolveExprs();
  }
}

class Resolver {
  private readonly resolved: Set<string> = new Set<string>();
  private readonly resolving: Set<string> = new Set<string>();

  constructor(private readonly admin: EntityAdmin) {}

  resolveExprs(): void {
    this.resolved.clear();
    this.resolving.clear();
    for (const effect of this.admin.numbers()) {
      this.resolveExpr(effect);
    }
  }

  private resolveExpr(effect: NumberEffectEntity) {
    const id = effect.id;
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
    const calculatedValue = this.unwrap(effect.expr);
    this.resolving.delete(id);

    this.admin.number(id).set(calculatedValue);
    this.resolved.add(id);
  }

  private unwrap(expr: NumberExpr): number {
    if (typeof expr === "number") {
      return expr;
    } else {
      return expr({
        admin: this.admin,
        val: (id) => {
          const entity = this.admin.number(id);
          this.resolveExpr(entity);
          const value = entity.get();
          if (value === undefined) {
            throw new CouldNotResolveEffectError(id, "value not in store");
          }
          return value;
        },
      });
    }
  }
}

export interface NumberValueStore {
  get(id: string): number | undefined;
  set(id: string, val: number): void;
}

class CouldNotResolveEffectError extends Error {
  constructor(readonly id: NumberEffectId, readonly reason: string) {
    super(`could not resolve value for effect '${id}': ${reason}`);
  }
}

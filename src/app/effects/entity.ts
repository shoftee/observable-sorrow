import { EffectId } from "../core/metadata";
import { ChangeTrackedEntity } from "../ecs";
import { EntityAdmin } from "../game/entity-admin";

export type PoolState = Record<EffectId, number>;

export interface EffectEntry {
  get(): number | undefined;
  set(value: number | undefined): void;
}

export class EffectPoolEntity extends ChangeTrackedEntity<PoolState> {
  private values!: Map<EffectId, number>;

  constructor(admin: EntityAdmin) {
    super(admin, "effects");
  }

  init(): void {
    this.values = new Map<EffectId, number>();
  }

  get(id: EffectId): number | undefined {
    return this.values.get(id);
  }

  set(id: EffectId, value: number | undefined): void {
    const current = this.get(id);
    if (value === undefined) {
      this.values.delete(id);
    } else {
      this.values.set(id, value);
    }

    if (value !== current) {
      this.changes.mark(id);
    }
  }

  entry(id: EffectId): EffectEntry {
    return {
      get: () => this.get(id),
      set: (value) => this.set(id, value),
    };
  }
}

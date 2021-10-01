import { reactive } from "vue";

import { EffectId } from "@/_interfaces";
import { Entity } from "../ecs";

export type EffectState = Partial<Record<EffectId, number>>;

export interface EffectEntry {
  get(): number | undefined;
  set(value: number | undefined): void;
}

export class EffectPoolEntity extends Entity {
  readonly state: EffectState;

  constructor() {
    super("effects");
    this.state = reactive({});
  }

  get(id: EffectId): number | undefined {
    return Reflect.get(this.state, id);
  }

  set(id: EffectId, value: number | undefined): void {
    Reflect.set(this.state, id, value);
  }

  entry(id: EffectId): EffectEntry {
    return {
      get: () => this.get(id),
      set: (value) => this.set(id, value),
    };
  }
}

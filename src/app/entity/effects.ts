import { reactive } from "vue";

import { EffectId } from "@/_interfaces";

import { Entity, Expr } from ".";

export interface EffectEntry {
  get(): number | undefined;
  set(value: number | undefined): void;
}

export class EffectEntity extends Entity {
  readonly state: { value?: number };

  constructor(readonly id: EffectId, readonly expr: Expr) {
    super(id);
    this.state = reactive({ value: undefined });
  }

  get(): number | undefined {
    return this.state.value;
  }

  set(value: number | undefined): void {
    this.state.value = value;
  }
}

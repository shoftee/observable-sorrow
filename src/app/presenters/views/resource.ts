import { computed, reactive } from "vue";

import { ResourceId } from "@/app/interfaces";
import { Meta, UnitKind } from "@/app/state";

import { EffectTree, NumberView } from "../common";
import { IStateManager } from "../state-manager";

export interface ResourceView {
  readonly id: ResourceId;
  label: string;
  unlocked: boolean;
  amount: number;
  change: NumberView | undefined;
  capacity?: number;
  modifier?: NumberView;
  deltaTree?: EffectTree;
}

export function newResourceView(
  manager: IStateManager,
  id: ResourceId,
): ResourceView {
  const meta = Meta.resource(id);
  const state = manager.state.resources[meta.id];

  return reactive({
    id: meta.id,
    label: meta.label,
    unlocked: computed(() => state.unlocked),
    amount: computed(() => state.amount),
    change: computed(() => change(state.delta)),
    capacity: computed(() => state.capacity),
  });
}

function change(change: number | undefined): NumberView | undefined {
  if (change !== undefined) {
    return {
      value: change,
      style: { unit: UnitKind.PerTick },
      showSign: "always",
    };
  } else {
    return undefined;
  }
}

import { reactive, computed } from "vue";

import { ResourceId } from "@/app/interfaces";
import { Meta, UnitKind } from "@/app/state";

import { EffectTree, NumberView } from "../common";
import { IStateManager } from "../state-manager";

export interface ResourceView {
  readonly id: ResourceId;
  label: string;
  unlocked: boolean;
  amount: number;
  change: NumberView;
  capacity?: number;
  modifier?: NumberView;
  deltaTree?: EffectTree;
}

export function newResourceView(
  id: ResourceId,
  manager: IStateManager,
): ResourceView {
  const meta = Meta.resource(id);
  const state = manager.state.resources[meta.id];

  return reactive({
    id: meta.id,
    label: meta.label,
    unlocked: computed(() => state.unlocked),
    amount: computed(() => state.amount),
    change: computed(
      () =>
        ({
          value: state.delta,
          style: { unit: UnitKind.PerTick },
          showSign: "always",
        } as NumberView),
    ),
    capacity: computed(() => state.capacity),
  });
}

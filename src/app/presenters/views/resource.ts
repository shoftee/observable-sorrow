import { reactive, computed } from "vue";

import { ResourceId } from "@/app/interfaces";
import { Meta, ResourceState, UnitKind } from "@/app/state";

import { effectTree, EffectTree, numberView, NumberView } from "../common";
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
  const res = manager.resource(id);

  return reactive({
    id: meta.id,
    label: meta.label,
    unlocked: computed(() => res.unlocked),
    amount: computed(() => res.amount),
    change: computed(() =>
      meta.id !== "kittens" ? resourceChange(res) : kittensChange(manager),
    ),
    capacity: computed(() => res.capacity),
    modifier: computed(() =>
      meta.id === "catnip" ? numberView(manager, "weather.ratio") : undefined,
    ),
    deltaTree: computed(() =>
      meta.effects.delta !== undefined
        ? effectTree(meta.effects.delta, manager)
        : undefined,
    ),
  });
}

function resourceChange(res: ResourceState): NumberView {
  return {
    value: res.change,
    style: { unit: UnitKind.PerTick },
    showSign: "always",
  };
}

function kittensChange(manager: IStateManager): NumberView {
  return {
    value: manager.stockpile("kitten-growth").amount,
    style: { unit: UnitKind.Percent },
    showSign: "negative",
    rounded: true,
  };
}

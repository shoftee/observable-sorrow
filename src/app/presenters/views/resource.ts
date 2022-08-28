import { computed, reactive } from "vue";

import { ResourceId } from "@/app/interfaces";
import { Meta, ResourceMetadataType } from "@/app/state";

import { EffectTree, numberView, NumberView } from "../common";
import { IStateManager } from "../state-manager";
import { StateSchema } from "@/app/game/systems2/core";

export interface ResourceView {
  readonly id: ResourceId;
  label: string;
  unlocked: boolean;
  amount: number;
  change: NumberView | undefined;
  capacity?: NumberView | undefined;
  modifier?: NumberView;
  deltaTree?: EffectTree;
}

export function newResourceView(
  manager: IStateManager,
  id: ResourceId,
): ResourceView {
  const meta = Meta.resource(id);
  const state = manager.state;
  const resource = state.resources[meta.id];

  return reactive({
    id: meta.id,
    label: meta.label,
    unlocked: computed(() => resource.unlocked),
    amount: computed(() => resource.amount),
    change: computed(() => changeView(meta, state)),
    capacity: computed(() => capacityView(meta, state)),
  });
}

function changeView(
  meta: ResourceMetadataType,
  state: StateSchema,
): NumberView | undefined {
  if (meta.effects.delta) {
    return numberView(state, meta.effects.delta);
  } else {
    return undefined;
  }
}

function capacityView(
  meta: ResourceMetadataType,
  state: StateSchema,
): NumberView | undefined {
  if (meta.effects.limit) {
    return numberView(state, meta.effects.limit, "negative");
  } else {
    return undefined;
  }
}

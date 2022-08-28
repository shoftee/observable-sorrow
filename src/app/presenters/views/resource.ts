import { computed, reactive } from "vue";

import { ResourceId } from "@/app/interfaces";
import { Meta, ResourceMetadataType } from "@/app/state";

import { StateSchema } from "@/app/game/systems2/core";

import { effectTree, EffectTree, numberView, NumberView } from "../common";
import { IStateManager } from "../state-manager";

export interface ResourceView {
  readonly id: ResourceId;
  label: string;
  unlocked: boolean;
  amount: number;
  change?: NumberView;
  capacity?: NumberView;
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
    modifier: computed(() => modifierView(meta, state)),
    deltaTree: computed(() => deltaTreeView(meta, state)),
  });
}

function changeView(meta: ResourceMetadataType, state: StateSchema) {
  if (meta.effects.delta) {
    return numberView(state, meta.effects.delta);
  } else {
    return undefined;
  }
}

function capacityView(meta: ResourceMetadataType, state: StateSchema) {
  if (meta.effects.limit) {
    return numberView(state, meta.effects.limit, "negative");
  } else {
    return undefined;
  }
}

function modifierView(meta: ResourceMetadataType, state: StateSchema) {
  if (meta.effects.modifier) {
    return numberView(state, meta.effects.modifier);
  } else {
    return undefined;
  }
}

function deltaTreeView(meta: ResourceMetadataType, state: StateSchema) {
  if (meta.effects.delta) {
    return effectTree(meta.effects.delta, state);
  } else {
    return undefined;
  }
}

import { computed, reactive } from "vue";

import { ResourceId } from "@/app/interfaces";
import { Meta, ResourceMetadataType } from "@/app/state";

import { StateSchema } from "@/app/game/systems2/core";

import { effectTree, EffectTree, numberView, NumberView } from "../common";

import { fromIds } from "./array";

export interface ResourceView {
  readonly id: ResourceId;
  label: string;
  unlocked: boolean;
  amount: number;
  change?: NumberView;
  limit?: NumberView;
  modifier?: NumberView;
  deltaTree?: EffectTree;
}

export function allResourceViews(schema: StateSchema) {
  const ids = computed(() => Object.keys(schema.resources) as ResourceId[]);
  return fromIds(schema, ids, newResourceView);
}

export function newResourceView(
  schema: StateSchema,
  id: ResourceId,
): ResourceView {
  const meta = Meta.resource(id);
  const resource = schema.resources[meta.id];

  return reactive({
    id: meta.id,
    label: meta.label,
    unlocked: computed(() => resource.unlocked),
    amount: computed(() => resource.amount),
    change: computed(() => changeView(meta, schema)),
    limit: computed(() => limitView(meta, schema)),
    modifier: computed(() => modifierView(meta, schema)),
    deltaTree: computed(() => deltaTreeView(meta, schema)),
  });
}

function changeView(meta: ResourceMetadataType, state: StateSchema) {
  if (meta.effects.delta) {
    return numberView(state, meta.effects.delta);
  } else {
    return undefined;
  }
}

function limitView(meta: ResourceMetadataType, state: StateSchema) {
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

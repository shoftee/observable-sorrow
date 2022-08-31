import { computed, reactive } from "vue";

import { SectionId } from "@/app/interfaces";
import { Meta } from "@/app/state";

import { StateSchema } from "@/app/game/systems2/core";

import { fromIds } from "./array";

export function allSectionViews(schema: StateSchema) {
  const ids = computed(() => Object.keys(schema.sections) as SectionId[]);
  return fromIds(schema, ids, newSectionView);
}

export interface SectionView {
  readonly id: SectionId;
  readonly parentId: SectionId | undefined;
  unlocked: boolean;
  title: string;
  alert?: string | undefined;
}

export function newSectionView(
  schema: StateSchema,
  id: SectionId,
): SectionView {
  const meta = Meta.section(id);
  const state = schema.sections[id];
  return reactive({
    id: id,
    parentId: meta.parent,
    unlocked: computed(() => state.unlocked),
    title: computed(() => state.title),
    alert: computed(() => state.alert),
  });
}

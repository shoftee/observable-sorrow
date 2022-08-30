import { computed, reactive } from "vue";

import { SectionId } from "@/app/interfaces";
import { Meta } from "@/app/state";

import { IStateManager } from "..";
import { fromIds } from "./array";

export function allSectionViews(manager: IStateManager) {
  const ids = computed(
    () => Object.keys(manager.state.sections) as SectionId[],
  );
  return fromIds(manager, ids, newSectionView);
}

export interface SectionView {
  readonly id: SectionId;
  readonly parentId: SectionId | undefined;
  unlocked: boolean;
  title: string;
  alert?: string | undefined;
}

export function newSectionView(
  manager: IStateManager,
  id: SectionId,
): SectionView {
  const meta = Meta.section(id);
  const state = manager.state.sections[id];
  return reactive({
    id: id,
    parentId: meta.parent,
    unlocked: computed(() => state.unlocked),
    title: computed(() => state.title),
    alert: computed(() => state.alert),
  });
}

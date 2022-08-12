import { computed, reactive } from "vue";

import { SectionId } from "@/app/interfaces";
import { Meta } from "@/app/state";

import { IStateManager } from "..";

export interface SectionView {
  readonly id: SectionId;
  readonly parentId: SectionId | undefined;
  unlocked: boolean;
  label: string;
  alert?: string | undefined;
}

export function newSectionView(
  id: SectionId,
  manager: IStateManager,
): SectionView {
  const meta = Meta.section(id);
  const state = manager.section(id);
  return reactive({
    id: id,
    parentId: meta.parent,
    label: computed(() => state.label),
    unlocked: computed(() => state.unlocked),
    alert: computed(() => state.alert),
  });
}

import { computed, reactive } from "vue";

import { SectionId } from "@/app/interfaces";
import { Meta, SectionMetadataType, SectionState } from "@/app/state";

import { StateManager } from ".";

export class SectionsPresenter {
  readonly items: Map<SectionId, SectionItem>;
  readonly unlocked = computed(() =>
    Array.from(this.items.values()).filter((x) => x.unlocked),
  );

  constructor(manager: StateManager) {
    this.items = manager.sections().toMap(
      ([id]) => id,
      ([id, state]) => this.newSectionItem(id, Meta.section(id), state),
    );
  }

  private newSectionItem(
    id: SectionId,
    meta: SectionMetadataType,
    state: SectionState,
  ): SectionItem {
    return reactive({
      id: id,
      parentId: meta.parent,
      label: computed(() => state.label),
      unlocked: computed(() => state.unlocked),
      alert: computed(() => state.alert),
    });
  }
}

export interface SectionItem {
  readonly id: SectionId;
  readonly parentId: SectionId | undefined;
  unlocked: boolean;
  label: string;
  alert?: string | undefined;
}

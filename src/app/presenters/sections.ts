import { computed, reactive } from "vue";

import { SectionId } from "@/app/interfaces";
import { Meta, SectionMetadataType, SectionState } from "@/app/state";

import { IStateManager } from ".";

export class SectionsPresenter {
  readonly items: Map<SectionId, SectionItem>;

  constructor(manager: IStateManager) {
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

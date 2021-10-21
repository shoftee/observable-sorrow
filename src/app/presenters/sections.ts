import { computed, reactive } from "vue";

import { SectionId } from "@/app/interfaces";
import { SectionState } from "@/app/state";

import { StateManager } from ".";

export class SectionsPresenter {
  readonly items: SectionItem[];

  constructor(manager: StateManager) {
    this.items = manager
      .sections()
      .map(([id, state]) => this.newSectionItem(id, state))
      .toArray();
  }

  private newSectionItem(id: SectionId, state: SectionState): SectionItem {
    return reactive({
      id: id,
      label: computed(() => state.label),
      unlocked: computed(() => state.unlocked),
      alert: computed(() => state.alert),
    });
  }
}

export interface SectionItem {
  readonly id: SectionId;
  unlocked: boolean;
  label: string;
  alert?: string | undefined;
}

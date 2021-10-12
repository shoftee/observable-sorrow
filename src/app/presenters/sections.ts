import { computed, reactive } from "vue";

import { StateManager } from ".";

export class SectionsPresenter {
  readonly items: SectionItem[];
  constructor(manager: StateManager) {
    this.items = [
      reactive({
        id: "bonfire",
        label: "sections.bonfire.label",
        active: true,
        alert: false,
        unlocked: true,
      }),
      reactive({
        id: "society",
        label: "sections.society.village",
        active: false,
        alert: computed(() => manager.resource("kittens").amount > 0),
        unlocked: computed(() => manager.society().unlocked),
      }),
    ];
  }
}

export type SectionId = "bonfire" | "society";

export interface SectionItem {
  readonly id: SectionId;
  label: string;
  alert: boolean;
  unlocked: boolean;
}

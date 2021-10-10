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
        unlocked: computed(() => manager.population().unlocked),
      }),
    ];
  }
}

export interface SectionItem {
  id: "bonfire" | "society";
  label: string;
  alert: boolean;
  active: boolean;
  unlocked: boolean;
}

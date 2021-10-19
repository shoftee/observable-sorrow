import { computed, reactive } from "vue";

import { SocietyState } from "@/app/state";

import { StateManager } from ".";

export class SectionsPresenter {
  readonly items: SectionItem[];

  constructor(manager: StateManager) {
    this.items = [this.bonfireSection(), this.societySection(manager)];
  }

  private bonfireSection(): SectionItem {
    return reactive({
      id: "bonfire",
      label: "sections.bonfire.label",
      active: true,
      unlocked: true,
    });
  }

  private societySection(manager: StateManager): SectionItem {
    const society = manager.society();
    return reactive({
      id: "society",
      label: computed(() => this.societyLabel(society)),
      active: false,
      alert: computed(() => this.societyAlertText(society)),
      unlocked: computed(() => society.unlocked),
    });
  }

  private societyLabel(society: SocietyState): string {
    if (society.totalPops === 0) {
      return "sections.society.outpost";
    } else if (society.totalPops < 5) {
      return "sections.society.small-village";
    } else {
      return "sections.society.village";
    }
  }

  private societyAlertText(society: SocietyState): string | undefined {
    return society.unemployedPops === 0
      ? undefined
      : society.unemployedPops < 100
      ? society.unemployedPops.toFixed(0)
      : "99+";
  }
}

export type SectionId = "bonfire" | "society";

export interface SectionItem {
  readonly id: SectionId;
  label: string;
  alert?: string | undefined;
  unlocked: boolean;
}

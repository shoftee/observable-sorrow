import { computed, reactive } from "vue";

import { SectionId } from "@/app/interfaces";
import { Meta } from "@/app/state";

import { IStateManager } from ".";

export class SectionsPresenter {
  readonly bonfire: SectionItem;
  readonly society: SectionItem;
  readonly jobs: SectionItem;
  readonly management: SectionItem;
  readonly science: SectionItem;
  readonly technologies: SectionItem;

  readonly topLevelSections;

  constructor(manager: IStateManager) {
    this.bonfire = this.newSectionItem("bonfire", manager);
    this.society = this.newSectionItem("society", manager);
    this.jobs = this.newSectionItem("jobs", manager);
    this.management = this.newSectionItem("management", manager);
    this.science = this.newSectionItem("science", manager);
    this.technologies = this.newSectionItem("technologies", manager);

    this.topLevelSections = [this.bonfire, this.society, this.science];
  }

  private newSectionItem(id: SectionId, manager: IStateManager): SectionItem {
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
}

export interface SectionItem {
  readonly id: SectionId;
  readonly parentId: SectionId | undefined;
  unlocked: boolean;
  label: string;
  alert?: string | undefined;
}

import { computed, ComputedRef, reactive } from "vue";

import { ResearchIntent, TechId } from "@/app/interfaces";
import { Meta, TechMetadataType } from "@/app/state";

import { StateManager } from ".";
import { FulfillmentItem, fulfillment } from "./common/fulfillment";

export class SciencePresenter {
  readonly items: ComputedRef<TechItem[]>;

  constructor(manager: StateManager) {
    this.items = computed(() =>
      manager
        .techs()
        .map((id) => this.newTechItem(id, manager))
        .toArray(),
    );
  }

  private newTechItem(id: TechId, manager: StateManager): TechItem {
    const meta = Meta.tech(id);
    const state = manager.tech(id);
    return reactive({
      ...this.staticData(meta),
      intent: { kind: "research", id: "research-tech", tech: meta.id },

      unlocked: computed(() => state.unlocked),
      researched: computed(() => state.researched),

      fulfillment: computed(() => fulfillment(meta.id, manager)),
      effects: meta.effects,
    });
  }

  private staticData(meta: TechMetadataType) {
    return {
      id: meta.id,
      label: meta.label,
      description: meta.description,
      flavor: meta.flavor,
    };
  }
}

export interface TechItem {
  id: TechId;
  intent: ResearchIntent;
  label: string;
  description: string;
  flavor: string | undefined;
  unlocked: boolean;
  researched: boolean;
  effects: TechEffectItem[];
  fulfillment: FulfillmentItem;
}

export interface TechEffectItem {
  id: string;
  label: string;
}

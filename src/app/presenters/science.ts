import { computed, ComputedRef, reactive } from "vue";

import { TechId } from "@/app/interfaces";
import { Meta } from "@/app/state";

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
      id: meta.id,
      label: meta.label,
      description: meta.description,
      flavor: meta.flavor,
      unlocked: computed(() => state.unlocked),
      researched: computed(() => state.researched),

      fulfillment: computed(() => fulfillment(meta.id, manager)),
      effects: meta.effects,
    });
  }
}

export interface TechItem {
  id: TechId;
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

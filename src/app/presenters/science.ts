import { computed, ComputedRef, reactive } from "vue";

import { ResearchIntent, TechId } from "@/app/interfaces";
import { Meta, TechMetadataType } from "@/app/state";

import { IStateManager } from ".";
import { fulfillmentView, FulfillmentItemView } from "./common";

export class SciencePresenter {
  readonly items: ComputedRef<TechItem[]>;

  constructor(manager: IStateManager) {
    this.items = computed(() =>
      manager
        .techs()
        .map((id) => this.newTechItem(id, manager))
        .toArray(),
    );
  }

  private newTechItem(id: TechId, manager: IStateManager): TechItem {
    const meta = Meta.tech(id);
    const fulfillment = manager.state.fulfillments[id];
    const tech = manager.state.techs[id];
    return reactive({
      ...this.staticData(meta),
      intent: { kind: "research", id: "research-tech", tech: meta.id },

      unlocked: computed(() => fulfillment.unlocked),
      researched: computed(() => tech.researched),

      fulfillment: computed(() => fulfillmentView(manager.state, fulfillment)),
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
  fulfillment: FulfillmentItemView;
}

export interface TechEffectItem {
  id: string;
  label: string;
}

import { computed, reactive } from "vue";

import { TechnologyId } from "@/app/interfaces";
import { Meta, TechMetadataType } from "@/app/state";

import { StateManager } from ".";
import { IngredientItem, fromIngredients } from "./common/ingredients";

export interface TechItem {
  id: TechnologyId;
  label: string;
  description: string;
  flavor: string | undefined;
  unlocked: boolean;
  researched: boolean;
  effects: TechEffectItem[];
  ingredients: IngredientItem[];
  fulfilled: boolean;
  capped: boolean;
}

export interface TechEffectItem {
  id: string;
  label: string;
}

export class SciencePresenter {
  readonly items: TechItem[];

  constructor(manager: StateManager) {
    this.items = Meta.technologies()
      .map((meta) => this.newTechItem(meta, manager))
      .toArray();
  }

  private newTechItem(meta: TechMetadataType, manager: StateManager): TechItem {
    const state = manager.technology(meta.id);
    return reactive({
      id: meta.id,
      label: meta.label,
      description: meta.description,
      flavor: meta.flavor,
      unlocked: computed(() => state.unlocked),
      researched: computed(() => state.researched),

      ingredients: computed(() => fromIngredients(state.ingredients)),
      fulfilled: computed(() => state.fulfilled),
      capped: computed(() => state.capped),

      effects: meta.effects,
    });
  }
}

import { computed, ComputedRef, reactive } from "vue";

import { TechId } from "@/app/interfaces";
import { Meta } from "@/app/state";

import { StateManager } from ".";
import { IngredientItem, fromIngredients } from "./common/ingredients";

export interface TechItem {
  id: TechId;
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

      ingredients: computed(() => fromIngredients(state.ingredients)),
      fulfilled: computed(() => state.fulfilled),
      capped: computed(() => state.capped),

      effects: meta.effects,
    });
  }
}

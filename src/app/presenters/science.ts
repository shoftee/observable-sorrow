import { computed, ComputedRef, reactive } from "vue";

import { TechnologyId } from "@/app/interfaces";
import { Meta } from "@/app/state";

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
  readonly items: ComputedRef<TechItem[]>;

  constructor(manager: StateManager) {
    this.items = computed(() =>
      manager
        .technologies()
        .map((id) => this.newTechItem(id, manager))
        .toArray(),
    );
  }

  private newTechItem(id: TechnologyId, manager: StateManager): TechItem {
    const meta = Meta.technology(id);
    const state = manager.technology(id);
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

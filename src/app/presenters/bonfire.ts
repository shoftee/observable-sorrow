import { computed, reactive } from "vue";

import { BonfireItemId, BuildingId } from "@/app/interfaces";
import { BonfireMetadataType, Meta } from "@/app/state";

import { NumberView, IStateManager } from ".";
import { fromIngredients, IngredientItem } from "./common/ingredients";

export class BonfirePresenter {
  readonly all: BonfireItem[];

  constructor(manager: IStateManager) {
    this.all = Meta.bonfireItems()
      .map((meta) => this.newBonfireItem(meta, manager))
      .toArray();
  }

  private newBonfireItem(
    meta: BonfireMetadataType,
    manager: IStateManager,
  ): BonfireItem {
    if (meta.intent.kind === "gather-catnip") {
      return reactive({
        id: meta.id,
        label: meta.label,
        description: meta.description,
        flavor: meta.flavor,

        unlocked: true,
        capped: false,
        fulfilled: true,
      });
    } else if (meta.intent.kind === "refine-catnip") {
      const state = manager.recipe(meta.intent.recipeId);
      return reactive({
        id: meta.id,
        label: meta.label,
        description: meta.description,
        flavor: meta.flavor,

        unlocked: true,
        ingredients: computed(() => fromIngredients(state.ingredients)),
        capped: computed(() => state.capped),
        fulfilled: computed(() => state.fulfilled),
      });
    } else {
      const buildingId = meta.intent.buildingId;
      const state = manager.building(buildingId);
      return reactive({
        id: meta.id,
        label: meta.label,
        description: meta.description,
        flavor: meta.flavor,

        unlocked: computed(() => state.unlocked),
        level: computed(() => state.level),
        ingredients: computed(() => fromIngredients(state.ingredients)),
        capped: computed(() => state.capped),
        fulfilled: computed(() => state.fulfilled),

        effects: computed(() => this.effects(buildingId, manager)),
      });
    }
  }

  private effects(
    buildingId: BuildingId,
    manager: IStateManager,
  ): EffectItem[] {
    const effects = Meta.building(buildingId).effects;
    return Array.from(effects, (meta) =>
      reactive({
        id: meta.id,
        label: meta.label,
        singleAmount: manager.numberView(meta.per),
        totalAmount: manager.numberView(meta.total),
      }),
    );
  }
}

export interface BonfireItem {
  id: BonfireItemId;

  label: string;
  description: string;
  flavor?: string;

  unlocked: boolean;
  level?: number;
  fulfilled: boolean;
  capped: boolean;

  ingredients?: IngredientItem[];
  effects?: EffectItem[];
}

export interface EffectItem {
  id: string;
  label: string;
  singleAmount: NumberView;
  totalAmount: NumberView;
}

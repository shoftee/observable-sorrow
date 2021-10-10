import { computed, reactive } from "vue";

import { BonfireItemId, ResourceId, EffectId } from "@/_interfaces";
import {
  BonfireMetadataType,
  BuildingEffectType,
  IngredientState,
  Meta,
} from "@/_state";

import { NumberView, IStateManager } from ".";

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
        capped: computed(() => state.capped),
        fulfilled: computed(() => state.fulfilled),

        ingredients: computed(() => this.ingredients(state.ingredients)),
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
        capped: computed(() => state.capped),
        fulfilled: computed(() => state.fulfilled),

        ingredients: computed(() => this.ingredients(state.ingredients)),
        effects: computed(() =>
          this.effects(Meta.building(buildingId).effects, manager),
        ),
      });
    }
  }

  private effects(
    effects: BuildingEffectType[],
    manager: IStateManager,
  ): EffectItem[] {
    return Array.from(effects, (meta) =>
      reactive({
        id: meta.total,
        label: meta.label,
        perLevelAmount: manager.effectView(meta.per),
        totalAmount: manager.effectView(meta.total),
      }),
    );
  }

  private ingredients(ingredients: IngredientState[]): IngredientItem[] {
    return Array.from(ingredients, (state) =>
      reactive({
        id: state.resourceId,
        label: Meta.resource(state.resourceId).label,
        requirement: computed(() => state.requirement),
        fulfillment: computed(() => state.fulfillment),
        fulfilled: computed(() => state.fulfilled),
        fulfillmentTime: computed(() => state.fulfillmentTime),
        capped: computed(() => state.capped),
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

export interface IngredientItem {
  id: ResourceId;
  label: string;
  requirement: number;
  fulfillment: number;
  fulfilled: boolean;
  fulfillmentTime?: number | undefined;
  capped: boolean;
}

export interface EffectItem {
  id: EffectId;
  label: string;
  perLevelAmount: NumberView;
  totalAmount: NumberView;
}

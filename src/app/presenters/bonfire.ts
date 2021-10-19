import { computed, reactive } from "vue";

import { BonfireItemId, ResourceId, UnitKind } from "@/app/interfaces";
import {
  BonfireMetadataType,
  BuildingEffectType,
  IngredientState,
  Meta,
} from "@/app/state";

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
        id: meta.id,
        label: meta.label,
        singleAmount: manager.effectView(meta.per),
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
        fulfillmentTime: computed(() => this.fulfillmentTime(state)),
        capped: computed(() => state.capped),
      }),
    );
  }

  private fulfillmentTime(ingredient: IngredientState): NumberView | undefined {
    if (ingredient.fulfillmentTime === undefined) {
      return undefined;
    }
    return {
      value: ingredient.fulfillmentTime,
      unit: UnitKind.Tick,
      rounded: true,
      showSign: "negative",
    };
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
  fulfillmentTime?: NumberView | undefined;
  capped: boolean;
}

export interface EffectItem {
  id: string;
  label: string;
  singleAmount: NumberView;
  totalAmount: NumberView;
}

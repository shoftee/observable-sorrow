import { computed, ComputedRef, reactive } from "vue";

import { BonfireItemId, ResourceId, EffectId } from "@/_interfaces";
import {
  BonfireMetadataType,
  BuildingEffectType,
  IngredientState,
  Meta,
} from "@/_state";

import { EffectView, IStateManager } from ".";

export class BonfirePresenter {
  readonly all: ComputedRef<BonfireItem[]>;

  constructor(private readonly manager: IStateManager) {
    this.all = computed(() => {
      return Meta.bonfireItems()
        .map((meta) => this.newBonfireItem(meta))
        .toArray();
    });
  }

  private newBonfireItem(meta: BonfireMetadataType): BonfireItem {
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
      const state = this.manager.recipe(meta.intent.recipeId);
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
      const state = this.manager.building(buildingId);
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
          this.effects(Meta.building(buildingId).effects.items),
        ),
      });
    }
  }

  private effects(effects: BuildingEffectType[]): EffectItem[] {
    return Array.from(effects, (meta) =>
      reactive({
        id: meta.total,
        label: meta.label,
        perLevelAmount: this.manager.effectView(meta.per),
        totalAmount: this.manager.effectView(meta.total),
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
  perLevelAmount: EffectView;
  totalAmount: EffectView;
}

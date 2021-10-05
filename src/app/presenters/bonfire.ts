import { computed, ComputedRef, reactive } from "vue";

import { BonfireItemId, ResourceId, EffectId } from "@/_interfaces";
import {
  BonfireMetadataType,
  BuildingEffectType,
  IngredientState,
  ResourceMetadata,
} from "@/_state";

import { EffectView, IRootPresenter, Metadata } from ".";

export interface IBonfirePresenter {
  readonly all: ComputedRef<BonfireItem[]>;
}

export class BonfirePresenter implements IBonfirePresenter {
  readonly all: ComputedRef<BonfireItem[]>;

  constructor(private readonly root: IRootPresenter) {
    this.all = computed(() => {
      return Metadata.bonfireItems()
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
      const state = this.root.recipe(meta.intent.recipeId);
      return reactive({
        id: meta.id,
        label: meta.label,
        description: meta.description,
        flavor: meta.flavor,

        unlocked: true,
        capped: computed(() => state.capped),
        fulfilled: computed(() => state.fulfilled),
        ingredients: this.ingredients(state.ingredients),
      });
    } else {
      const buildingId = meta.intent.buildingId;
      const state = this.root.building(buildingId);
      return reactive({
        id: meta.id,
        label: meta.label,
        description: meta.description,
        flavor: meta.flavor,

        unlocked: computed(() => state.unlocked),
        level: computed(() => state.level),
        capped: computed(() => state.capped),
        fulfilled: computed(() => state.fulfilled),
        ingredients: this.ingredients(state.ingredients),
        effects: this.effects(Metadata.building(buildingId).effects.items),
      });
    }
  }

  private effects(effects: BuildingEffectType[]): EffectItem[] | undefined {
    return reactive(
      Array.from(effects, (meta) =>
        reactive({
          id: meta.total,
          label: meta.label,
          perLevelAmount: this.root.effectView(meta.per),
          totalAmount: this.root.effectView(meta.total),
        }),
      ),
    );
  }

  private ingredients(
    ingredients: IngredientState[],
  ): IngredientItem[] | undefined {
    return reactive(
      Array.from(ingredients, (item) => {
        return this.newIngredientItem(item);
      }),
    );
  }

  private newIngredientItem(state: IngredientState): IngredientItem {
    return reactive({
      id: state.resourceId,
      label: ResourceMetadata[state.resourceId].label,
      requirement: computed(() => state.requirement),
      fulfillment: computed(() => state.fulfillment),
      fulfilled: computed(() => state.fulfilled),
      fulfillmentTime: computed(() => state.fulfillmentTime),
      capped: computed(() => state.capped),
    });
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

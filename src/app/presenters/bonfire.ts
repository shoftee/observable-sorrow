import { computed, ComputedRef, reactive } from "vue";

import { BonfireItemId, ResourceId, EffectId } from "@/_interfaces";
import {
  BonfireMetadata,
  BonfireMetadataType,
  BuildingEffectType,
  BuildingMetadata,
  IngredientState,
  ResourceMetadata,
} from "@/_state";
import { all, any } from "@/_utils/collections";

import { EffectView, IRootPresenter } from ".";

export interface IBonfirePresenter {
  readonly all: ComputedRef<BonfireItem[]>;
}

export class BonfirePresenter implements IBonfirePresenter {
  readonly all: ComputedRef<BonfireItem[]>;

  constructor(root: IRootPresenter) {
    this.all = computed(() => {
      return Array.from(
        Object.values(BonfireMetadata),
        (item) => new BonfireItem(item, root),
      );
    });
  }
}

export class BonfireItem {
  id: BonfireItemId;

  label: string;
  description: string;
  flavor?: string;

  unlocked: ComputedRef<boolean> = computed(() => true);
  level: ComputedRef<number> = computed(() => 0);
  fulfilled: ComputedRef<boolean> = computed(() => true);
  capped: ComputedRef<boolean> = computed(() => false);

  ingredients: IngredientItem[] = [];
  effects: EffectItem[] = [];

  constructor(meta: BonfireMetadataType, root: IRootPresenter) {
    this.id = meta.id;
    this.label = meta.label;
    this.description = meta.description;
    this.flavor = meta.flavor;

    if (meta.intent.kind === "refine-catnip") {
      const state = root.recipe(meta.intent.recipeId);
      this.ingredients = reactive(
        Array.from(state.ingredients, (item) => {
          return this.newIngredientItem(item);
        }),
      );
      this.capped = this.computeCapped(this.ingredients);
      this.fulfilled = this.computeFulfilled(this.ingredients);
    } else if (meta.intent.kind === "buy-building") {
      const buildingId = meta.intent.buildingId;
      const building = root.building(buildingId);
      this.level = computed(() => building.level);
      this.unlocked = computed(() => building.unlocked);
      this.ingredients = reactive(
        Array.from(building.ingredients.values(), (state) => {
          return this.newIngredientItem(state);
        }),
      );
      this.capped = computed(() => building.capped);
      this.fulfilled = computed(() => building.fulfilled);
      this.effects = reactive(
        Array.from(BuildingMetadata[buildingId].effects.resources, (meta) =>
          this.newEffect(root, meta),
        ),
      );
    }
  }

  private newEffect(
    root: IRootPresenter,
    meta: BuildingEffectType,
  ): EffectItem {
    return reactive({
      id: meta.total,
      label: meta.label,
      perLevelAmount: root.effectView(meta.per),
      totalAmount: root.effectView(meta.total),
    });
  }

  private newIngredientItem(state: IngredientState): IngredientItem {
    return reactive({
      id: state.resourceId,
      label: ResourceMetadata[state.resourceId].label,
      requirement: computed(() => state.requirement),
      fulfillment: computed(() => state.fulfillment),
      fulfilled: computed(() => state.fulfilled),
      capped: computed(() => state.capped),
    });
  }

  private computeFulfilled(items: IngredientItem[]): ComputedRef<boolean> {
    return computed(() => all(items.values(), (i) => i.fulfilled));
  }

  private computeCapped(items: IngredientItem[]): ComputedRef<boolean> {
    return computed(() => any(items.values(), (i) => i.capped));
  }
}

export interface IngredientItem {
  id: ResourceId;
  label: string;
  requirement: number;
  fulfillment: number;
  fulfilled: boolean;
  capped: boolean;
}

export interface EffectItem {
  id: EffectId;
  label: string;
  perLevelAmount: EffectView;
  totalAmount: EffectView;
}

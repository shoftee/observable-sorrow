import { computed, ComputedRef, reactive } from "vue";

import { BonfireItemId, ResourceId, EffectId } from "@/_interfaces";
import {
  BonfireMetadata,
  BonfireMetadataType,
  BuildingEffectType,
  BuildingMetadata,
  BuildingState,
  EffectState,
  IngredientState,
  ResourceMetadata,
  RecipeState,
} from "@/_state";
import { all, any } from "@/_utils/collections";

import { IRootPresenter } from ".";

export interface IBonfirePresenter {
  readonly all: ComputedRef<BonfireItem[]>;
}

export class BonfirePresenter implements IBonfirePresenter {
  readonly all: ComputedRef<BonfireItem[]>;

  constructor(private readonly root: IRootPresenter) {
    this.all = computed(() => {
      return Array.from(
        Object.values(BonfireMetadata),
        (item) => new BonfireItem(item, this.root),
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

  constructor(meta: BonfireMetadataType, updater: IRootPresenter) {
    this.id = meta.id;
    this.label = meta.label;
    this.description = meta.description;
    this.flavor = meta.flavor;

    if (meta.intent.kind === "refine-catnip") {
      const state = updater.get<RecipeState>(meta.intent.recipeId);
      this.ingredients = reactive(
        Array.from(state.ingredients, (item) => {
          return this.newIngredientItem(item);
        }),
      );
      this.capped = this.computeCapped(this.ingredients);
      this.fulfilled = this.computeFulfilled(this.ingredients);
    } else if (meta.intent.kind === "buy-building") {
      const buildingId = meta.intent.buildingId;
      const building = updater.get<BuildingState>(buildingId);
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
          this.newEffect(updater, meta),
        ),
      );
    }
  }

  private newEffect(
    root: IRootPresenter,
    meta: BuildingEffectType,
  ): EffectItem {
    const effects = root.get<EffectState>("effects");
    return reactive({
      id: meta.total,
      label: meta.label,
      perLevelAmount: computed(() => effects[meta.per] ?? 0),
      totalAmount: computed(() => effects[meta.total] ?? 0),
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
  perLevelAmount: number;
  totalAmount: number;
}

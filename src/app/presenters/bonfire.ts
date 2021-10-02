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
  ResourceState,
  WorkshopRecipeMetadata,
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
      const ingredients = WorkshopRecipeMetadata["refine-catnip"].ingredients;
      this.ingredients = reactive(
        Array.from(ingredients, ([id, amount]) => {
          const resource = updater.get<ResourceState>(id);
          return this.newRecipeIngredient(id, amount, resource);
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
          updater.get < ResourceState;
          return this.newBuildingIngredient(state);
        }),
      );
      this.effects = reactive(
        Array.from(BuildingMetadata[buildingId].effects.resources, (meta) =>
          this.newEffect(updater, meta),
        ),
      );
      this.capped = this.computeCapped(this.ingredients);
      this.fulfilled = this.computeFulfilled(this.ingredients);
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

  private newRecipeIngredient(
    id: ResourceId,
    requirement: number,
    resource: ResourceState,
  ): IngredientItem {
    return reactive({
      id: id,
      label: ResourceMetadata[id].label,
      requirement: requirement,
      fulfillment: computed(() => resource.amount),
      fulfilled: computed(() => resource.amount >= requirement),
      capped: computed(() => requirement > (resource.capacity ?? 0)),
    });
  }

  private newBuildingIngredient(
    ingredient: IngredientState,
    resource: ResourceState,
  ): IngredientItem {
    return reactive({
      id: ingredient.resourceId,
      label: ResourceMetadata[ingredient.resourceId].label,
      requirement: computed(() => ingredient.requirement),
      fulfillment: computed(() => ingredient.fulfillment),
      fulfilled: computed(() => ingredient.fulfilled),
      capped: computed(() => {
        const capped = requirement.value > (resource.capacity ?? 0);
        return capped;
      }),
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

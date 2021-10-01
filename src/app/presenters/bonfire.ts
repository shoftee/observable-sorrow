import { computed, ComputedRef, reactive } from "vue";

import { BonfireItemId, ResourceId, EffectId } from "@/_interfaces";
import {
  BonfireMetadata,
  BonfireMetadataType,
  BuildingEffectType,
  BuildingMetadata,
  BuildingState,
  ResourceMetadata,
} from "@/_state";

import { mapReduce } from "../utils/collections";

import { RootPresenter } from "./root";
import { WorkshopRecipeMetadata } from "../core/metadata";
import { ResourceState } from "../resources";
import { EffectState } from "../effects";

export interface IBonfirePresenter {
  readonly all: ComputedRef<BonfireItem[]>;
}

export class BonfirePresenter implements IBonfirePresenter {
  readonly all: ComputedRef<BonfireItem[]>;

  constructor(private readonly root: RootPresenter) {
    this.all = computed(() => {
      return Array.from(
        Object.values(BonfireMetadata),
        (item) => new BonfireItem(item, this.root),
      );
    });
  }
}

class BonfireItem {
  id: BonfireItemId;

  label: string;
  description: string;
  flavor?: string;

  unlocked: ComputedRef<boolean> = computed(() => true);
  level: ComputedRef<number> = computed(() => 0);
  fulfilled: ComputedRef<boolean> = computed(() => true);

  ingredients: IngredientItem[] = [];
  effects: EffectItem[] = [];

  constructor(meta: BonfireMetadataType, root: RootPresenter) {
    this.id = meta.id;
    this.label = meta.label;
    this.description = meta.description;
    this.flavor = meta.flavor;

    if (meta.intent.kind === "refine-catnip") {
      const ingredients = WorkshopRecipeMetadata["refine-catnip"].ingredients;
      this.ingredients = reactive(
        Array.from(ingredients, ([id, amount]) => {
          const resource = root.get<ResourceState>(id);
          return this.newRecipeIngredient(id, amount, resource);
        }),
      );
      this.fulfilled = this.computeFulfilled(this.ingredients);
    } else if (meta.intent.kind === "buy-building") {
      const buildingId = meta.intent.buildingId;
      const building = root.get<BuildingState>(buildingId);
      this.level = computed(() => building.level);
      this.unlocked = computed(() => building.unlocked);
      this.ingredients = reactive(
        Array.from(building.ingredients.keys(), (id) => {
          const resource = root.get<ResourceState>(id);
          return this.newBuildingIngredient(id, resource, building);
        }),
      );
      this.effects = reactive(
        Array.from(BuildingMetadata[buildingId].effects.resources, (meta) =>
          this.newEffect(root, meta),
        ),
      );
      this.fulfilled = this.computeFulfilled(this.ingredients);
    }
  }

  private newEffect(root: RootPresenter, meta: BuildingEffectType): EffectItem {
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
    });
  }

  private newBuildingIngredient(
    id: ResourceId,
    resource: ResourceState,
    building: BuildingState,
  ): IngredientItem {
    const requirement = computed(() => building.ingredients.get(id) ?? 0);
    return reactive({
      id: id,
      label: ResourceMetadata[id].label,
      requirement: requirement,
      fulfillment: computed(() => resource.amount),
      fulfilled: computed(() => resource.amount >= requirement.value),
    });
  }

  private computeFulfilled(items: IngredientItem[]): ComputedRef<boolean> {
    return computed(() =>
      mapReduce(
        items.values(),
        (i) => i.fulfilled,
        (acc, val) => acc && val,
        true,
      ),
    );
  }
}

interface IngredientItem {
  id: ResourceId;
  label: string;
  requirement: number;
  fulfillment: number;
  fulfilled: boolean;
}

interface EffectItem {
  id: EffectId;
  label: string;
  perLevelAmount: number;
  totalAmount: number;
}

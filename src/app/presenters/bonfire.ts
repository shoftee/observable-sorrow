import { computed, ComputedRef, reactive } from "vue";
import { asEnumerable } from "linq-es2015";

import { BonfireItemId, ResourceId, EffectId } from "@/_interfaces";
import {
  BonfireMetadata,
  BonfireMetadataType,
  BuildingEffectType,
  BuildingMetadata,
  BuildingState,
  ResourceMetadata,
} from "@/_state";

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
      return asEnumerable(Object.values(BonfireMetadata))
        .Select((item) => new BonfireItem(item, this.root))
        .ToArray();
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
        asEnumerable(ingredients)
          .Select((requirement) => this.newIngredientItem(requirement, root))
          .Select((i) => reactive(i))
          .ToArray(),
      );

      this.fulfilled = computed(() =>
        asEnumerable(this.ingredients).All((r) => r.fulfilled),
      );
    } else if (meta.intent.kind === "buy-building") {
      const buildingId = meta.intent.buildingId;
      const state = root.get<BuildingState>(buildingId);
      this.level = computed(() => state.level);
      this.unlocked = computed(() => state.unlocked);
      this.ingredients = reactive(
        asEnumerable(state.ingredients.entries())
          .Select((requirement) => this.newIngredientItem(requirement, root))
          .ToArray(),
      );
      this.effects = reactive(
        asEnumerable(BuildingMetadata[buildingId].effects.resources)
          .Select((meta) => this.newEffect(root, meta))
          .ToArray(),
      );

      this.fulfilled = computed(() =>
        this.ingredients
          .map((i) => i.fulfilled)
          .reduce((acc, val) => acc && val, true),
      );
    }
  }

  private newIngredientItem(
    requirement: [ResourceId, number],
    root: RootPresenter,
  ): IngredientItem {
    const [resourceId, requirementAmount] = requirement;
    const resource = root.get<ResourceState>(resourceId);
    return reactive({
      id: resourceId,
      label: ResourceMetadata[resourceId].label,
      requirement: computed(() => requirementAmount),
      fulfillment: computed(() => resource.amount),
      fulfilled: computed(() => resource.amount >= requirementAmount),
    });
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

import { computed, reactive } from "vue";

import { BonfireItemId, BuildingId } from "@/app/interfaces";
import { BonfireMetadataType, Meta } from "@/app/state";

import { NumberView, IStateManager } from ".";
import { fulfillment, FulfillmentItem } from "./common/fulfillment";

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
        fulfillment: {
          capped: false,
          fulfilled: true,
          ingredients: [],
        },
      });
    } else if (meta.intent.kind === "refine-catnip") {
      const recipeId = meta.intent.recipeId;
      return reactive({
        id: meta.id,
        label: meta.label,
        description: meta.description,
        flavor: meta.flavor,
        unlocked: true,

        fulfillment: computed(() => fulfillment(recipeId, manager)),
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

        fulfillment: computed(() => fulfillment(buildingId, manager)),
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
        singleAmount: computed(() => manager.numberView(meta.per)),
        totalAmount: computed(() => manager.numberView(meta.total)),
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

  fulfillment: FulfillmentItem;
  effects?: EffectItem[];
}

export interface EffectItem {
  id: string;
  label: string;
  singleAmount: NumberView;
  totalAmount: NumberView;
}

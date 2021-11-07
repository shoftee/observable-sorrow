import { computed, reactive } from "vue";

import { BuildingId, Intent } from "@/app/interfaces";
import { Meta, BonfireItemId, BonfireBuildingId } from "@/app/state";

import { IStateManager } from ".";
import { fulfillment, EffectItem, numberView, FulfillmentItem } from "./common";

export class BonfirePresenter {
  readonly all: BonfireItem[];

  constructor(manager: IStateManager) {
    this.all = Meta.bonfireItems()
      .map((meta) => this.newBonfireItem(meta, manager))
      .toArray();
  }

  private newBonfireItem(
    id: BonfireItemId,
    manager: IStateManager,
  ): BonfireItem {
    switch (id) {
      case "gather-catnip":
        return this.gatherCatnip();
      case "refine-catnip":
        return this.refineCatnip(manager);
      default:
        return this.buyBuilding(id, manager);
    }
  }

  private gatherCatnip(): BonfireItem {
    return reactive({
      id: "gather-catnip",
      intent: { kind: "bonfire", id: "gather-catnip" },
      label: "bonfire.gather-catnip.label",
      description: "bonfire.gather-catnip.description",

      unlocked: true,
      fulfillment: {
        capped: false,
        fulfilled: true,
        ingredients: [],
      },
    });
  }

  private refineCatnip(manager: IStateManager): BonfireItem {
    return reactive({
      id: "refine-catnip",
      intent: {
        kind: "workshop",
        id: "craft-recipe",
        recipe: "refine-catnip",
      },
      label: "bonfire.refine-catnip.label",
      description: "bonfire.refine-catnip.description",
      flavor: "bonfire.refine-catnip.flavor",

      unlocked: true,
      fulfillment: computed(() => fulfillment("refine-catnip", manager)),
    });
  }

  private buyBuilding(
    id: BonfireBuildingId,
    manager: IStateManager,
  ): BonfireItem {
    const building = Meta.building(id);
    const state = manager.building(building.id);
    return reactive({
      id: id,
      intent: {
        kind: "construction",
        id: "buy-building",
        building: building.id,
      },
      label: building.label,
      description: building.description,
      flavor: building.flavor,

      unlocked: computed(() => state.unlocked),
      level: computed(() => state.level),
      fulfillment: computed(() => fulfillment(building.id, manager)),
      effects: computed(() => this.effects(building.id, manager)),
    });
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
        singleAmount: computed(() => numberView(meta.per, manager)),
        totalAmount: computed(() => numberView(meta.total, manager)),
      }),
    );
  }
}

export interface BonfireItem {
  id: BonfireItemId;
  intent: Intent;

  label: string;
  description: string;
  flavor?: string;

  unlocked: boolean;
  level?: number;

  fulfillment: FulfillmentItem;
  effects?: EffectItem[];
}

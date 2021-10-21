import { reactive } from "vue";

import { BuildingId } from "@/app/interfaces";
import {
  BuildingMetadataType,
  BuildingState,
  ingredientsFromObject,
  Meta,
} from "@/app/state";
import { SaveState } from "@/app/store";

import { Entity, EntityPool, OrderStatus, Watcher } from ".";

export class BuildingEntity extends Entity<BuildingId> {
  readonly state: BuildingState;

  status: OrderStatus;

  constructor(readonly meta: BuildingMetadataType) {
    super(meta.id);

    this.state = reactive({
      ingredients: ingredientsFromObject(meta.prices.base),
      unlocked: false,
      level: 0,
      capped: false,
      fulfilled: false,
    });

    this.status = OrderStatus.EMPTY;
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }
}

export class BuildingsPool extends EntityPool<BuildingId, BuildingEntity> {
  constructor(watcher: Watcher) {
    super("buildings", watcher);
    for (const meta of Meta.buildings()) {
      this.add(new BuildingEntity(meta));
    }
  }

  loadState(save: SaveState): void {
    const buildings = save?.buildings;

    if (buildings !== undefined) {
      for (const building of this.enumerate()) {
        const buildingState = buildings[building.id];
        if (buildingState?.level !== undefined) {
          building.state.level = buildingState.level;
        }
      }
    }
  }

  saveState(save: SaveState): void {
    save.buildings = {};

    for (const building of this.enumerate()) {
      save.buildings[building.id] = {
        level: building.state.level,
      };
    }
  }
}

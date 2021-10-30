import { reactive } from "vue";

import { BuildingId } from "@/app/interfaces";
import { BuildingMetadataType, BuildingState, Meta } from "@/app/state";
import { SaveState } from "@/app/store";

import {
  Entity,
  EntityPool,
  OrderStatus,
  Persisted,
  Watched,
  Watcher,
} from ".";

export class BuildingEntity extends Entity<BuildingId> implements Watched {
  readonly state: BuildingState;

  status: OrderStatus;

  constructor(readonly meta: BuildingMetadataType) {
    super(meta.id);

    this.state = reactive<BuildingState>({
      unlocked: false,
      level: 0,
    });

    this.status = OrderStatus.EMPTY;
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }

  saveTo(store: NonNullable<SaveState["buildings"]>): void {
    const stored = store[this.id];
    if (stored === undefined) {
      store[this.id] = {
        level: this.state.level,
        unlocked: this.state.unlocked,
      };
    } else {
      stored.level = this.state.level;
      stored.unlocked = this.state.unlocked;
    }
  }

  loadFrom(store: NonNullable<SaveState["buildings"]>): void {
    const stored = store[this.id];
    if (stored !== undefined) {
      this.state.level = stored.level;
      this.state.unlocked = stored.unlocked;
    }
  }
}

export class BuildingsPool
  extends EntityPool<BuildingId, BuildingEntity>
  implements Persisted
{
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
        building.loadFrom(buildings);
      }
    }
  }

  saveState(save: SaveState): void {
    save.buildings = {};
    for (const building of this.enumerate()) {
      building.saveTo(save.buildings);
    }
  }
}

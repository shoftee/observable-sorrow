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

type BuildingStore = NonNullable<SaveState["buildings"]>[BuildingId];

export class BuildingEntity extends Entity<BuildingId> implements Watched {
  readonly state: BuildingState;

  orderStatus: OrderStatus;

  constructor(readonly meta: BuildingMetadataType) {
    super(meta.id);

    this.state = reactive<BuildingState>({
      unlocked: false,
      level: 0,
    });

    this.orderStatus = OrderStatus.EMPTY;
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }

  save(): BuildingStore {
    return {
      level: this.state.level,
      unlocked: this.state.unlocked,
    };
  }

  load(stored: BuildingStore): void {
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
        building.load(buildings[building.id]);
      }
    }
  }

  saveState(save: SaveState): void {
    save.buildings = {};
    for (const building of this.enumerate()) {
      save.buildings[building.id] = building.save();
    }
  }
}

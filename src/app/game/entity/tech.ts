import { reactive } from "vue";

import { TechId } from "@/app/interfaces";
import {
  ingredientsFromObject,
  Meta,
  TechMetadataType,
  TechState,
} from "@/app/state";

import {
  Entity,
  EntityPool,
  OrderStatus,
  Persisted,
  Watched,
  Watcher,
} from ".";
import { SaveState } from "@/app/store";

export class TechEntity extends Entity<TechId> implements Watched {
  readonly state: TechState;
  status: OrderStatus;

  constructor(meta: TechMetadataType) {
    super(meta.id);

    this.state = reactive({
      unlocked: false,
      researched: false,
      ingredients: ingredientsFromObject(meta.ingredients),
      fulfilled: false,
      capped: false,
    });

    this.status = OrderStatus.EMPTY;
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }
}

export class TechsPool
  extends EntityPool<TechId, TechEntity>
  implements Persisted
{
  constructor(watcher: Watcher) {
    super("techs", watcher);
    for (const meta of Meta.techs()) {
      this.add(new TechEntity(meta));
    }
  }

  loadState(state: SaveState): void {
    if (state.science) {
      for (const tech of this.enumerate()) {
        const saved = state.science[tech.id];
        if (saved !== undefined) {
          tech.state.researched = saved.researched;
        }
      }
    }
  }

  saveState(state: SaveState): void {
    state.science = {};

    for (const tech of this.enumerate()) {
      if (tech.state.researched) {
        // only store researched techs
        state.science[tech.id] = { researched: true };
      }
    }
  }
}

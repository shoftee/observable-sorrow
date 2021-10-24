import { reactive } from "vue";

import { TechnologyId } from "@/app/interfaces";
import {
  ingredientsFromObject,
  Meta,
  TechMetadataType,
  TechnologyState,
} from "@/app/state";

import { Entity, EntityPool, OrderStatus, Watcher } from ".";
import { SaveState } from "@/app/store";

export class TechnologyEntity extends Entity<TechnologyId> {
  readonly state: TechnologyState;
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

export class TechnologiesPool extends EntityPool<
  TechnologyId,
  TechnologyEntity
> {
  constructor(watcher: Watcher) {
    super("technologies", watcher);
    for (const meta of Meta.technologies()) {
      this.add(new TechnologyEntity(meta));
    }
  }

  loadState(state: SaveState): void {
    if (state.science) {
      for (const technology of this.enumerate()) {
        const saved = state.science[technology.id];
        if (saved !== undefined) {
          technology.state.researched = saved.researched;
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

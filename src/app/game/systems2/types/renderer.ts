import { EcsComponent, EcsResource } from "@/app/ecs";
import {
  All,
  AllParams,
  AllResults,
  ChangeTrackers,
  Query,
  Res,
} from "@/app/ecs/query";
import { System } from "@/app/ecs/system";
import { Constructor as Ctor } from "@/app/utils/types";

import {
  EventsSchema,
  DeltaSchema,
  RemovedDeltaSchema,
  visitState,
  StateSchema,
} from "../core";

export class ComponentDeltas {
  added: DeltaSchema = {};
  changed: DeltaSchema = {};
  removed: RemovedDeltaSchema = {};
  events: EventsSchema = {};

  clear() {
    this.added = {};
    this.changed = {};
    this.removed = {};
    this.events = {};
  }

  setAdded(fn: (root: StateSchema) => void) {
    visitState(this.added as StateSchema, fn);
  }

  setChanged(fn: (root: StateSchema) => void) {
    visitState(this.changed as StateSchema, fn);
  }

  setRemoved(fn: (root: RemovedDeltaSchema) => void) {
    visitState(this.removed, fn);
  }
}

export class DeltaBuffer extends EcsResource {
  readonly components: ComponentDeltas = new ComponentDeltas();
}

export function DeltaRecorder<C extends EcsComponent, Q extends AllParams>(
  tracked: Ctor<C>,
  ...stateQuery: Q
) {
  return (
    mutator: (root: StateSchema, tracked: C, state: AllResults<Q>) => void,
  ) => {
    return System(
      Res(DeltaBuffer),
      Query(ChangeTrackers(tracked), All<Q>(...stateQuery)),
    )((buffer, query) => {
      for (const [tracker, state] of query.all()) {
        if (tracker.isAdded()) {
          buffer.components.setAdded((root) =>
            mutator(root, tracker.value(), state),
          );
        } else if (tracker.isChanged()) {
          buffer.components.setChanged((root) =>
            mutator(root, tracker.value(), state),
          );
        }
      }
    });
  };
}

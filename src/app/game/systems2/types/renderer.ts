import { EcsComponent, EcsResource } from "@/app/ecs";
import { ChangeTrackers, Query, Read, Res } from "@/app/ecs/query";
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

export function ChangeTrackingSystem<
  Id extends EcsComponent,
  State extends EcsComponent,
>(
  idCtor: Ctor<Id>,
  stateCtor: Ctor<State>,
  writerFn: (root: StateSchema, id: Id, state: State) => void,
) {
  return System(
    Res(DeltaBuffer),
    Query(Read(idCtor), ChangeTrackers(stateCtor)),
  )((buffer, query) => {
    for (const [id, tracker] of query.all()) {
      if (tracker.isAdded()) {
        buffer.components.setAdded((root) =>
          writerFn(root, id, tracker.value()),
        );
      } else if (tracker.isChanged()) {
        buffer.components.setChanged((root) =>
          writerFn(root, id, tracker.value()),
        );
      }
    }
  });
}

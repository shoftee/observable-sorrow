import { EcsResource } from "@/app/ecs";

import {
  EventsSchema,
  DeltaSchema,
  RemovedDeltaSchema,
  visitState,
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

  setAdded(fn: (root: DeltaSchema) => void) {
    visitState(this.added, fn);
  }

  setChanged(fn: (root: DeltaSchema) => void) {
    visitState(this.changed, fn);
  }

  setRemoved(fn: (root: RemovedDeltaSchema) => void) {
    visitState(this.removed, fn);
  }
}

export class DeltaBuffer extends EcsResource {
  readonly components: ComponentDeltas = new ComponentDeltas();
}

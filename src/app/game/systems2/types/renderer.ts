import { EcsResource } from "@/app/ecs";

import {
  EventsSchema,
  addState,
  changeState,
  DeltaSchema,
  RemovedDeltaSchema,
  mergeRemovals,
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

  setAdded(obj: DeltaSchema) {
    addState(this.added, obj);
  }

  setChanged(obj: DeltaSchema) {
    changeState(this.changed, obj);
  }

  setRemoved(obj: RemovedDeltaSchema) {
    mergeRemovals(this.removed, obj);
  }
}

export class DeltaBuffer extends EcsResource {
  readonly components: ComponentDeltas = new ComponentDeltas();
}

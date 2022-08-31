import { Queue } from "queue-typescript";

import { EcsComponent, EcsEntity, EntitySym, WorldTicks } from "./types";
import {
  ComponentState,
  EventState,
  HierarchyState,
  ResourceState,
  QueryState,
} from "./state";

type EcsCommand = (world: World) => Iterable<EcsEntity>;

export class World {
  private readonly entities = new Set<EcsEntity>();
  private readonly commands = new Queue<EcsCommand>();
  readonly ticks = new WorldTicks();

  readonly components = new ComponentState(this.ticks);
  readonly events = new EventState();
  readonly hierarchy = new HierarchyState();
  readonly resources = new ResourceState();
  readonly queries = new QueryState(this);

  private newEntityId = 0;

  spawn(...components: EcsComponent[]): EcsEntity {
    const entity = Object.freeze({ [EntitySym]: ++this.newEntityId });
    this.entities.add(entity);
    this.components.insert(entity, ...components);
    return entity;
  }

  despawn(entity: EcsEntity) {
    this.components.removeAll(entity);
    this.hierarchy.unlinkFromChildren(entity);
    this.hierarchy.unlinkFromParent(entity);
    this.entities.delete(entity);
  }

  defer(command: EcsCommand) {
    this.commands.enqueue(command);
  }

  flush() {
    const entities = new Set<EcsEntity>();

    let command;
    while ((command = this.commands.dequeue())) {
      for (const entity of command(this)) {
        entities.add(entity);
      }
    }

    this.queries.notifyChanged(...entities);
  }
}

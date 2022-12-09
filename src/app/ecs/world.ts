import { Queue } from "queue-typescript";

import { addRange, consume } from "@/app/utils/collections";

import { EcsComponent, EcsEntity, WorldTicks } from "./types";

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
    const entity = Object.freeze(new EcsEntity(this.newEntityId++));
    this.entities.add(entity);
    this.components.insert(entity, ...components);
    return entity;
  }

  despawn(entity: EcsEntity) {
    this.components.removeAll(entity);
    this.hierarchy.unlink(entity);
    this.entities.delete(entity);
  }

  defer(command: EcsCommand) {
    this.commands.enqueue(command);
  }

  flush() {
    const entities = new Set<EcsEntity>();
    for (const command of consume(this.commands)) {
      addRange(entities, command(this));
    }
    this.queries.notifyChanged(...entities);
  }
}

import { MultiMap, Table } from "@/app/utils/collections";
import { Constructor as Ctor, getConstructorOf } from "@/app/utils/types";

import {
  Archetype,
  CHANGE_TICKS,
  ComponentTicks,
  EcsEntity,
  EcsComponent,
  IMMUTABLE,
  WorldTicks,
} from "../types";

export class ComponentState {
  private readonly components = new Table<
    EcsEntity,
    Ctor<EcsComponent>,
    EcsComponent
  >();

  private readonly removed = new MultiMap<Ctor<EcsComponent>, EcsEntity>();

  constructor(private readonly ticks: WorldTicks) {}

  insert(entity: EcsEntity, ...components: EcsComponent[]) {
    const added = this.ticks.current;
    for (const component of components) {
      const ctor = getConstructorOf(component);
      this.components.add(entity, ctor, (exists) => {
        if (exists) {
          throw new Error(`Entity already has component of type ${ctor}.`);
        }

        component[CHANGE_TICKS] = new ComponentTicks(added);
        if (IMMUTABLE in component) {
          Object.freeze(component);
        }

        return component;
      });
    }
  }

  remove(entity: EcsEntity, ...ctors: Ctor<EcsComponent>[]) {
    for (const ctor of ctors) {
      if (this.components.removeCell(entity, ctor)) {
        this.removed.add(ctor, entity);
      }
    }
  }

  removeAll(entity: EcsEntity) {
    for (const ctor of this.components.row(entity).keys()) {
      this.removed.add(ctor, entity);
    }
    this.components.removeRow(entity);
  }

  removedComponents(ctor: Ctor<EcsComponent>) {
    return this.removed.entriesForKey(ctor);
  }

  forgetRemovedComponents() {
    this.removed.clear();
  }

  archetype(entity: EcsEntity): Archetype {
    return this.components.row(entity);
  }

  *archetypes(): Iterable<[EcsEntity, Archetype]> {
    yield* this.components.rows();
  }

  *entities(): Iterable<EcsEntity> {
    for (const [entity] of this.components.rows()) {
      yield entity;
    }
  }
}

import { Table } from "@/app/utils/collections";
import { Constructor as Ctor, getConstructorOf } from "@/app/utils/types";

import {
  EcsEntity,
  EcsComponent,
  ChangeTicks,
  ComponentTicks,
  Archetype,
  WorldTicks,
} from "../types";

export class ComponentState {
  private readonly components = new Table<
    EcsEntity,
    Ctor<EcsComponent>,
    EcsComponent
  >();

  constructor(private readonly ticks: WorldTicks) {}

  insert(entity: EcsEntity, ...components: EcsComponent[]) {
    const added = this.ticks.advance();
    for (const component of components) {
      component[ChangeTicks] = new ComponentTicks(added);
      const ctor = getConstructorOf(component);
      this.components.add(entity, ctor, (exists) => {
        if (exists) {
          throw new Error(`Entity already has component of type ${ctor}.`);
        }
        return component;
      });
    }
  }

  remove(entity: EcsEntity, ...ctors: Ctor<EcsComponent>[]) {
    for (const ctor of ctors) {
      this.components.removeCell(entity, ctor);
    }
  }

  removeAll(entity: EcsEntity) {
    this.components.removeRow(entity);
  }

  archetype(entity: EcsEntity): Archetype {
    return this.components.row(entity);
  }

  *archetypes(): Iterable<[EcsEntity, Archetype]> {
    yield* this.components.rows();
  }
}

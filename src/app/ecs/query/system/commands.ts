import { EcsComponent, EcsEntity } from "@/app/ecs";
import { Constructor as Ctor } from "@/app/utils/types";
import { FetcherFactory } from "../types";

type Commands = {
  spawn(...components: EcsComponent[]): void;
  despawn(entity: EcsEntity): void;
  insertComponents(entity: EcsEntity, ...components: EcsComponent[]): void;
  removeComponents(entity: EcsEntity, ...ctors: Ctor<EcsComponent>[]): void;
};

/** Used to spawn entities and populate them with components. */
export function Commands(): FetcherFactory<Commands> {
  return {
    create(state) {
      const commands = {
        spawn(...components: EcsComponent[]) {
          state.defer(function* (world) {
            yield world.spawn(...components);
          });
        },
        insertComponents(entity: EcsEntity, ...components: EcsComponent[]) {
          state.defer(function* (world) {
            world.insertComponents(entity, ...components);
            yield entity;
          });
        },
        removeComponents(entity: EcsEntity, ...ctors: Ctor<EcsComponent>[]) {
          state.defer(function* (world) {
            world.removeComponents(entity, ...ctors);
            yield entity;
          });
        },
        despawn(entity: EcsEntity) {
          state.defer(function* (world) {
            world.despawn(entity);
            yield entity;
          });
        },
      };
      return {
        fetch() {
          return commands;
        },
      };
    },
  };
}

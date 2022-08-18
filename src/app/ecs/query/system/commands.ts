import { EcsComponent, EcsEntity } from "@/app/ecs";
import { FetcherFactory } from "../types";

type Commands = {
  spawn(...components: EcsComponent[]): EcsEntity;
  insertComponents(entity: EcsEntity, ...components: EcsComponent[]): void;
};

/** Used to spawn entities and populate them with components. */
export function Commands(): FetcherFactory<Commands> {
  return {
    create(state) {
      const commands = {
        spawn(...components: EcsComponent[]) {
          const entity = state.spawn();
          state.insertComponentsDeferred(entity, ...components);
          return entity;
        },
        insertComponents(entity: EcsEntity, ...components: EcsComponent[]) {
          state.insertComponentsDeferred(entity, ...components);
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

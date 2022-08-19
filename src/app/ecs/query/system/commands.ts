import {
  EcsComponent,
  EcsEntity,
  EcsParent,
  World,
  WorldState,
} from "@/app/ecs";
import { Constructor as Ctor } from "@/app/utils/types";

class EntityCommands {
  constructor(private readonly state: WorldState, private entity?: EcsEntity) {}

  private ensureSpawned(world: World): EcsEntity {
    return this.entity ?? (this.entity = world.spawn());
  }

  insert(...components: EcsComponent[]): EntityCommands {
    this.state.defer((world) => {
      const entity = this.ensureSpawned(world);
      world.insertComponents(entity, ...components);
      return [entity];
    });
    return this;
  }

  remove(...ctors: Ctor<EcsComponent>[]): EntityCommands {
    this.state.defer((world) => {
      const entity = this.ensureSpawned(world);
      world.removeComponents(entity, ...ctors);
      return [entity];
    });
    return this;
  }

  asParent(fn: (parent: EcsEntity) => void): EntityCommands {
    this.state.defer((world) => {
      const entity = this.ensureSpawned(world);
      fn(entity);
      return [entity];
    });
    return this;
  }
}

/** Used to spawn entities and populate them with components. */
export function Commands() {
  return {
    create(state: WorldState) {
      const commands = {
        with(entity: EcsEntity): EntityCommands {
          return new EntityCommands(state, entity);
        },
        spawn(...components: EcsComponent[]): EntityCommands {
          return new EntityCommands(state).insert(...components);
        },
        spawnChild(
          parent: EcsEntity,
          ...components: EcsComponent[]
        ): EntityCommands {
          return new EntityCommands(state).insert(
            new EcsParent(parent),
            ...components,
          );
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

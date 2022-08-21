import { EcsComponent, EcsEntity, World } from "@/app/ecs";
import { Constructor as Ctor } from "@/app/utils/types";

type CommandParams = {
  self?: EcsEntity;
  parent?: EcsEntity;
};

class EntityCommands {
  private readonly parent?: EcsEntity;
  private self?: EcsEntity;

  constructor(private readonly world: World, params?: CommandParams) {
    this.parent = params?.parent;
    this.self = params?.self;
  }

  private ensureSpawned(world: World): EcsEntity {
    if (!this.self) {
      this.self = world.spawn();
      if (this.parent) {
        world.hierarchy.link(this.parent, [this.self]);
      }
    }
    return this.self;
  }

  insert(...components: EcsComponent[]): EntityCommands {
    this.world.defer((world) => {
      const entity = this.ensureSpawned(world);
      world.components.insert(entity, ...components);
      return [entity];
    });
    return this;
  }

  remove(...ctors: Ctor<EcsComponent>[]): EntityCommands {
    this.world.defer((world) => {
      const entity = this.ensureSpawned(world);
      world.components.remove(entity, ...ctors);
      return [entity];
    });
    return this;
  }

  entity(fn: (entity: EcsEntity) => void): EntityCommands {
    this.world.defer((world) => {
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
    create(world: World) {
      const commands = {
        with(entity: EcsEntity): EntityCommands {
          return new EntityCommands(world, { self: entity });
        },
        spawn(...components: EcsComponent[]): EntityCommands {
          return new EntityCommands(world).insert(...components);
        },
        spawnChild(
          parent: EcsEntity,
          ...components: EcsComponent[]
        ): EntityCommands {
          return new EntityCommands(world, { parent }).insert(...components);
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

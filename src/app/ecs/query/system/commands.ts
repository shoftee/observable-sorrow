import { Constructor as Ctor } from "@/app/utils/types";

import { EcsComponent, EcsEntity, World, inspectable } from "@/app/ecs";

import { SystemParamDescriptor } from "../types";

export type WorldCmds = {
  with(entity: EcsEntity): EntityCmds;
  spawn(...components: EcsComponent[]): EntityCmds;
  spawnChild(parent: EcsEntity, ...components: EcsComponent[]): EntityCmds;
};

export type EntityCmds = {
  insert(...components: EcsComponent[]): EntityCmds;
  remove(...ctors: Ctor<EcsComponent>[]): EntityCmds;
  defer(fn: (entity: EcsEntity) => void): EntityCmds;
};

type CommandParams = {
  self?: EcsEntity;
  parent?: EcsEntity;
};

class EntityCommandsImpl {
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
        world.hierarchy.linkOne(this.parent, this.self);
      }
    }
    return this.self;
  }

  insert(...components: EcsComponent[]): EntityCommandsImpl {
    this.world.defer((world) => {
      const entity = this.ensureSpawned(world);
      world.components.insert(entity, ...components);
      return [entity];
    });
    return this;
  }

  remove(...ctors: Ctor<EcsComponent>[]): EntityCommandsImpl {
    this.world.defer((world) => {
      const entity = this.ensureSpawned(world);
      world.components.remove(entity, ...ctors);
      return [entity];
    });
    return this;
  }

  defer(fn: (entity: EcsEntity) => void): EntityCommandsImpl {
    this.world.defer((world) => {
      const entity = this.ensureSpawned(world);
      fn(entity);
      return [entity];
    });
    return this;
  }
}

type CommandsFactory = SystemParamDescriptor<WorldCmds>;

/** Used to spawn entities and populate them with components. */
export function Commands(): CommandsFactory {
  return {
    inspect() {
      return inspectable(Commands);
    },
    create(world: World) {
      const commands: WorldCmds = {
        with(entity) {
          return new EntityCommandsImpl(world, { self: entity });
        },
        spawn(...components) {
          return new EntityCommandsImpl(world).insert(...components);
        },
        spawnChild(parent, ...components) {
          return new EntityCommandsImpl(world, { parent }).insert(
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

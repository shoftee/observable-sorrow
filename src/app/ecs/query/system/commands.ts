import { Constructor as Ctor } from "@/app/utils/types";

import { EcsComponent, EcsEntity, World, inspectable } from "@/app/ecs";

import { SystemParamDescriptor } from "../types";

export interface WorldCmds {
  spawn(...components: EcsComponent[]): EntityCmds;
  spawnChild(parent: EcsEntity, ...components: EcsComponent[]): EntityCmds;
  with(entity: EcsEntity): EntityCmds;
  link(parent: EcsEntity, ...children: EcsEntity[]): WorldCmds;
  despawn(...entities: EcsEntity[]): WorldCmds;
}

export interface EntityCmds {
  insert(...components: EcsComponent[]): EntityCmds;
  remove(...ctors: Ctor<EcsComponent>[]): EntityCmds;
  defer(fn: (entity: EcsEntity) => void): EntityCmds;
}

interface CommandParams {
  self?: EcsEntity;
  parent?: EcsEntity;
}

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

function makeWorldCommands(world: World): WorldCmds {
  return {
    spawn(...components) {
      return new EntityCommandsImpl(world).insert(...components);
    },
    spawnChild(parent, ...components) {
      return new EntityCommandsImpl(world, { parent }).insert(...components);
    },
    with(entity) {
      return new EntityCommandsImpl(world, { self: entity });
    },
    link(parent, ...children) {
      world.defer(function* (world: World) {
        world.hierarchy.link(parent, children);
        yield parent;
        yield* children;
      });
      return this;
    },
    despawn(...entities) {
      world.defer(function* (world: World) {
        for (const entity of entities) {
          world.despawn(entity);
        }
        yield* entities;
      });
      return this;
    },
  };
}

type CommandsFactory = SystemParamDescriptor<WorldCmds>;
/** Used to create and remove entities and components. */
export function Commands(): CommandsFactory {
  return {
    inspect() {
      return inspectable(Commands);
    },
    create(world: World) {
      const commands = makeWorldCommands(world);
      return {
        fetch() {
          return commands;
        },
      };
    },
  };
}

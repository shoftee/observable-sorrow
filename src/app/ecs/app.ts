import { Constructor as Ctor, getConstructorOf } from "@/app/utils/types";
import { MultiMap, TypeSet } from "@/app/utils/collections";

import { EcsEvent, EcsResource, World, WorldState } from "./world";
import { IntoSystem, SystemRunner } from "./system";

export type SystemStage =
  | "startup"
  | "first"
  | "preUpdate"
  | "update"
  | "postUpdate"
  | "last";

export class App {
  private readonly systemBuilders = new MultiMap<SystemStage, IntoSystem>();
  private readonly resources = new TypeSet<EcsResource>();
  private readonly events = new Set<Ctor<EcsEvent>>();

  registerEvent(ctor: Ctor<EcsEvent>): App {
    this.events.add(ctor);
    return this;
  }

  insertResource<R extends EcsResource>(resource: R): App {
    this.resources.add(resource);
    return this;
  }

  addStartupSystem(system: IntoSystem): App {
    return this.addSystem(system, "startup");
  }

  addSystem(system: IntoSystem, stage: SystemStage = "update"): App {
    this.systemBuilders.add(stage, system);
    return this;
  }

  addPlugin(p: EcsPlugin): App {
    p.add(this);
    return this;
  }

  buildRunner(): GameRunner {
    const world = new World();
    for (const [, resource] of this.resources.entries()) {
      world.insertResource(resource);
    }
    for (const event of this.events) {
      world.registerEvent(event);
    }

    const state = new WorldState(world);
    const systems = new MultiMap<SystemStage, SystemRunner>();
    for (const [stage, builders] of this.systemBuilders) {
      for (const builder of builders) {
        systems.add(stage, builder.intoSystem(state));
      }
    }
    return new GameRunner(state, systems);
  }
}

export class GameRunner {
  private firstRun = true;

  constructor(
    private readonly state: WorldState,
    private readonly stages: MultiMap<SystemStage, SystemRunner>,
  ) {}

  start(): () => void {
    return () => this.update();
  }

  private update(): void {
    if (this.firstRun) {
      this.run("startup");
      this.firstRun = false;
    }
    this.run("first");
    this.run("preUpdate");
    this.run("update");
    this.run("postUpdate");
    this.run("last");
  }

  private run(stage: SystemStage) {
    for (const system of this.stages.entriesForKey(stage)) {
      system.run();
    }
    this.state.flushDeferred();
  }

  resource<R extends EcsResource>(ctor: Ctor<R>): R | undefined {
    return this.state.world.resource(ctor);
  }

  dispatch<E extends EcsEvent>(event: E) {
    this.state.world.events(getConstructorOf(event)).enqueue(event);
  }
}

export abstract class EcsPlugin {
  abstract add(app: App): void;
}

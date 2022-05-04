import { Constructor } from "@/app/utils/types";
import { MultiMap, TypeSet } from "@/app/utils/collections";

import { Event, Resource, World, WorldState } from "./world";
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
  private readonly resources = new TypeSet<Resource>();
  private readonly events = new Set<Constructor<Event>>();

  registerEvent(ctor: Constructor<Event>): App {
    this.events.add(ctor);
    return this;
  }

  insertResource<R extends Resource>(resource: R): App {
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

  plugin(p: Plugin): App {
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
    this.run("first");
    if (this.firstRun) {
      this.run("startup");
      this.firstRun = false;
    }
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
}

export abstract class Plugin {
  abstract add(app: App): void;
}

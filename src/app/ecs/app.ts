import { Queue } from "queue-typescript";

import { Constructor as Ctor, getConstructorOf } from "@/app/utils/types";
import { any, MultiMap, TypeSet } from "@/app/utils/collections";

import { SystemRunner, SystemSpecification as SystemSpec } from "./system";
import { EcsResource, EcsEvent, EcsStage, EcsStageType } from "./types";
import { World, WorldState } from "./world";

type SystemId = { id: string };
type TopologySpecParam = {
  after?: SystemId[];
  stage?: EcsStage;
};
type TopologySpec = SystemId & { after?: SystemId[] };

export class App {
  private readonly systems = new Map<string, SystemSpec>();
  private readonly topology = new MultiMap<string, TopologySpec>();

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

  addStartupSystem(spec: SystemSpec): App {
    return this.addSystem(spec, { stage: "startup" });
  }

  addSystem(spec: SystemSpec, topology?: Partial<TopologySpecParam>): App {
    this.systems.set(spec.id, spec);
    this.topology.add(topology?.stage ?? "main", {
      id: spec.id,
      after: topology?.after ?? [],
    });
    return this;
  }

  addPlugin(plugin: EcsPlugin): App {
    plugin.add(this);
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
    const systems = new MultiMap<string, SystemRunner>();
    for (const [stage, topologySpec] of this.topology) {
      for (const spec of this.orderByTopology(stage, topologySpec)) {
        systems.add(stage, spec.build(state));
      }
    }
    return new GameRunner(state, systems);
  }

  private orderByTopology(
    stage: string,
    topologySpecs: Iterable<TopologySpec>,
  ): SystemSpec[] {
    const dependencies = new MultiMap<string, string>();
    const remaining = new Map<string, SystemSpec>();
    for (const dependency of topologySpecs) {
      dependencies.addAll(
        dependency.id,
        (dependency.after ?? []).map((v) => v.id),
      );
      const systemSpec = this.systems.get(dependency.id)!;
      remaining.set(dependency.id, systemSpec);
    }

    const searchQueue = new Queue<SystemSpec>();
    const ordered = [];
    while (remaining.size > 0) {
      // find systems that don't have any 'run after' dependencies remaining
      for (const [id, spec] of remaining) {
        if (
          !any(dependencies.entriesForKey(id), (dependencyId) =>
            remaining.has(dependencyId),
          )
        ) {
          // if we got here, it means the dependencies for system 'id' have all been processed already.
          searchQueue.enqueue(spec);
        }
      }

      let processed = false;
      let next: SystemSpec;
      while ((next = searchQueue.dequeue())) {
        ordered.push(next);
        remaining.delete(next.id);
        processed = true;
      }

      if (!processed) {
        throw new Error(
          `Could not resolve system topology of stage '${stage}' because of a dependency cycle. Remaining systems: ${remaining}`,
        );
      }
    }
    return ordered;
  }
}

export class GameRunner {
  private firstRun = true;

  constructor(
    private readonly state: WorldState,
    private readonly stages: MultiMap<string, SystemRunner>,
  ) {}

  start(): () => void {
    return () => this.update();
  }

  private update(): void {
    if (this.firstRun) {
      this.runStageParts("startup");
      this.firstRun = false;
    }
    this.runStageParts("first");
    this.runStageParts("main");
    this.runStageParts("last");
  }

  private runStageParts(stageType: EcsStageType) {
    this.run(`${stageType}-start`);
    this.run(`${stageType}`);
    this.run(`${stageType}-end`);
  }

  private run(id: string) {
    for (const system of this.stages.entriesForKey(id)) {
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

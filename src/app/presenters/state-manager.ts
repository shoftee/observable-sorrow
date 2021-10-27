import { mergeWith } from "lodash";
import { reactive } from "vue";

import {
  BuildingId,
  MutationPool,
  EffectUnits,
  IPresenterChangeSink,
  JobId,
  NumberEffectId,
  PoolId,
  PopId,
  PropertyBag,
  RecipeId,
  ResourceId,
  SectionId,
  TechId,
  UnitKind,
  EventPool,
  EventId,
} from "@/app/interfaces";
import {
  BuildingState,
  EffectState,
  EnvironmentState,
  HistoryEvent,
  JobState,
  PlayerState,
  PopState,
  RecipeState,
  ResourceState,
  SectionState,
  SocietyState,
  TechState,
  TimeState,
} from "@/app/state";
import { asEnumerable, Enumerable } from "@/app/utils/enumerable";
import { ShowSign } from "@/app/utils/notation";

import { Channel } from "./common/channel";
import { getOrAdd } from "../utils/collections";

export interface IStateManager {
  buildings(): Enumerable<[BuildingId, BuildingState]>;
  building(id: BuildingId): BuildingState;

  numberView(id: NumberEffectId): NumberView;

  jobs(): Enumerable<[JobId, JobState]>;
  job(id: JobId): JobState;

  pops(): Enumerable<[PopId, PopState]>;

  recipes(): Enumerable<[RecipeId, RecipeState]>;
  recipe(id: RecipeId): RecipeState;

  resources(): Enumerable<[ResourceId, ResourceState]>;
  resource(id: ResourceId): ResourceState;

  sections(): Enumerable<[SectionId, SectionState]>;
  section(id: SectionId): SectionState;

  techs(): Enumerable<TechId>;
  tech(id: TechId): TechState;

  environment(): EnvironmentState;
  player(): PlayerState;
  society(): SocietyState;
  time(): TimeState;

  history(): Channel<HistoryEvent>;
}

export interface NumberView {
  value: number;
  unit: UnitKind;
  rounded?: boolean;
  showSign?: ShowSign;
}

class MutationPools extends Map<PoolId, Map<string, PropertyBag>> {
  get buildings(): Map<BuildingId, BuildingState> {
    return this.ensure("buildings") as unknown as Map<
      BuildingId,
      BuildingState
    >;
  }

  get jobs(): Map<JobId, JobState> {
    return this.ensure("jobs") as unknown as Map<JobId, JobState>;
  }

  get numbers(): Map<NumberEffectId, EffectState<number>> {
    return this.ensure("numbers") as unknown as Map<
      NumberEffectId,
      EffectState<number>
    >;
  }

  get pops(): Map<PopId, PopState> {
    return this.ensure("pops") as unknown as Map<PopId, PopState>;
  }

  get recipes(): Map<RecipeId, RecipeState> {
    return this.ensure("recipes") as unknown as Map<RecipeId, RecipeState>;
  }

  get resources(): Map<ResourceId, ResourceState> {
    return this.ensure("resources") as unknown as Map<
      ResourceId,
      ResourceState
    >;
  }

  get sections(): Map<SectionId, SectionState> {
    return this.ensure("sections") as unknown as Map<SectionId, SectionState>;
  }

  get techs(): Map<TechId, TechState> {
    return this.ensure("techs") as unknown as Map<TechId, TechState>;
  }

  ensure(id: PoolId): Map<string, PropertyBag> {
    return getOrAdd(this, id, () => reactive(new Map<string, PropertyBag>()));
  }
}

class EventPools extends Map<EventId, Channel> {
  get history(): Channel<HistoryEvent> {
    return this.ensure("history") as Channel<HistoryEvent>;
  }

  ensure(id: EventId): Channel {
    return getOrAdd(this, id, () => new Channel());
  }
}

export class StateManager implements IPresenterChangeSink, IStateManager {
  private readonly pools: MutationPools;
  private readonly events: EventPools;

  constructor() {
    this.pools = new MutationPools();
    this.events = new EventPools();
  }

  acceptMutations(mutations: MutationPool[]): void {
    for (const pool of mutations) {
      const values = this.pools.ensure(pool.poolId);
      if (pool.added) {
        for (const [id, state] of pool.added) {
          values.set(id, reactive(state));
        }
      }
      if (pool.updated) {
        for (const [id, state] of pool.updated) {
          updateObject(state, values.get(id));
        }
      }
      if (pool.removed) {
        for (const id of pool.removed) {
          values.delete(id);
        }
      }
    }
  }

  acceptEvents(events: EventPool[]): void {
    for (const pool of events) {
      const channel = this.events.ensure(pool.id);
      channel.push(pool.events);
    }
  }

  buildings(): Enumerable<[BuildingId, BuildingState]> {
    return asEnumerable(this.pools.buildings.entries());
  }

  building(id: BuildingId): BuildingState {
    return this.pools.buildings.get(id) as BuildingState;
  }

  numberView(id: NumberEffectId): NumberView {
    const number = this.pools.numbers.get(id) as EffectState<number>;
    return {
      value: number.value ?? 0,
      unit: EffectUnits[id] ?? UnitKind.None,
      rounded: false,
      showSign: "always",
    };
  }

  jobs(): Enumerable<[JobId, JobState]> {
    return asEnumerable(this.pools.jobs.entries());
  }

  job(id: JobId): JobState {
    return this.pools.jobs.get(id) as JobState;
  }

  pops(): Enumerable<[PopId, PopState]> {
    return asEnumerable(this.pools.pops.entries());
  }

  recipes(): Enumerable<[RecipeId, RecipeState]> {
    return asEnumerable(this.pools.recipes.entries());
  }

  recipe(id: RecipeId): RecipeState {
    return this.pools.recipes.get(id) as RecipeState;
  }

  resources(): Enumerable<[ResourceId, ResourceState]> {
    return asEnumerable(this.pools.resources.entries());
  }

  resource(id: ResourceId): ResourceState {
    return this.pools.resources.get(id) as ResourceState;
  }

  sections(): Enumerable<[SectionId, SectionState]> {
    return asEnumerable(this.pools.sections.entries());
  }

  section(id: SectionId): SectionState {
    return this.pools.sections.get(id) as SectionState;
  }

  techs(): Enumerable<TechId> {
    return asEnumerable(this.pools.techs.keys());
  }

  tech(id: TechId): TechState {
    return this.pools.techs.get(id) as TechState;
  }

  environment(): EnvironmentState {
    const pool = this.pools.ensure("singletons");
    return pool.get("environment") as unknown as EnvironmentState;
  }

  player(): PlayerState {
    const pool = this.pools.ensure("singletons");
    return pool.get("player") as unknown as PlayerState;
  }

  society(): SocietyState {
    const pool = this.pools.ensure("singletons");
    return pool.get("society") as unknown as SocietyState;
  }

  time(): TimeState {
    const pool = this.pools.ensure("singletons");
    return pool.get("time") as unknown as TimeState;
  }

  history(): Channel<HistoryEvent> {
    return this.events.history;
  }
}

function updateObject(src: PropertyBag, dst?: PropertyBag): PropertyBag {
  dst = dst ?? reactive({});
  mergeWith(dst, src, (dstValue, srcValue, key, dstObj) => {
    if (srcValue === undefined && dstValue !== undefined) {
      // undefined is a valid value
      dstObj[key] = undefined;
    } else {
      // leave it up to the calling method
      return undefined;
    }
  });
  return dst;
}

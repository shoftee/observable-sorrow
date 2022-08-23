import { mergeWith } from "lodash";
import { reactive } from "vue";

import {
  BuildingId,
  EventId,
  EventPool,
  FulfillmentId,
  IPresenterChangeSink,
  JobId,
  MutationPool,
  NumberEffectId,
  PoolId,
  PopId,
  PropertyBag,
  RecipeId,
  SectionId,
  TechId,
  StockpileId,
} from "@/app/interfaces";
import { Channel } from "@/app/presenters/common/channel";
import {
  BuildingState,
  EffectState,
  EffectTreeState,
  EnvironmentState,
  FulfillmentState,
  HistoryEvent,
  JobState,
  PlayerState,
  PopState,
  RecipeState,
  SectionState,
  StockpileState,
  TechState,
  TimeState,
} from "@/app/state";
import { getOrAdd } from "@/app/utils/collections";
import { Enumerable } from "@/app/utils/enumerable";
import {
  addState,
  changeState,
  removeState,
  StateSchema,
} from "@/app/game/systems2/core";
import { ComponentDeltas } from "@/app/game/systems2/core/renderer";

export interface IStateManager {
  state: StateSchema;

  buildings(): ReadonlyMap<BuildingId, BuildingState>;
  building(id: BuildingId): BuildingState;

  fulfillment(id: FulfillmentId): FulfillmentState;

  number(id: NumberEffectId): EffectState<number>;

  jobs(): Enumerable<[JobId, JobState]>;
  job(id: JobId): JobState;

  pops(): Enumerable<[PopId, PopState]>;

  recipe(id: RecipeId): RecipeState;

  sections(): ReadonlyMap<SectionId, SectionState>;
  section(id: SectionId): SectionState;

  stockpile(id: StockpileId): StockpileState;

  techs(): Enumerable<TechId>;
  tech(id: TechId): TechState;

  effectTree(): EffectTreeState;
  environment(): EnvironmentState;
  player(): PlayerState;
  time(): TimeState;

  history(): Channel<HistoryEvent>;
}

class MutationPools extends Map<PoolId, Map<string, PropertyBag>> {
  get buildings(): Map<BuildingId, BuildingState> {
    return this.ensure("buildings") as unknown as Map<
      BuildingId,
      BuildingState
    >;
  }

  get fulfillments(): Map<FulfillmentId, FulfillmentState> {
    return this.ensure("fulfillments") as unknown as Map<
      FulfillmentId,
      FulfillmentState
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

  get sections(): Map<SectionId, SectionState> {
    return this.ensure("sections") as unknown as Map<SectionId, SectionState>;
  }

  get stockpiles(): Map<StockpileId, StockpileState> {
    return this.ensure("stockpiles") as unknown as Map<
      StockpileId,
      StockpileState
    >;
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
  readonly state: StateSchema;

  private readonly pools: MutationPools;
  private readonly events: EventPools;

  constructor() {
    this.state = reactive({} as StateSchema);
    this.pools = new MutationPools();
    this.events = new EventPools();
  }

  acceptRender(deltas: ComponentDeltas): void {
    if (Object.entries(deltas.added).length > 0) {
      console.log("Added", deltas.added);
      addState(this.state, deltas.added);
    }

    if (Object.entries(deltas.changed).length > 0) {
      console.log("Changed", deltas.changed);
      changeState(this.state, deltas.changed);
    }

    if (Object.entries(deltas.removed).length > 0) {
      console.log("Removed", deltas.removed);
      removeState(this.state, deltas.removed);
    }
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

  buildings() {
    return this.pools.buildings;
  }

  building(id: BuildingId): BuildingState {
    return this.pools.buildings.get(id) as BuildingState;
  }

  fulfillment(id: FulfillmentId): FulfillmentState {
    return this.pools.fulfillments.get(id) as FulfillmentState;
  }

  jobs(): Enumerable<[JobId, JobState]> {
    return new Enumerable(this.pools.jobs.entries());
  }

  job(id: JobId): JobState {
    return this.pools.jobs.get(id) as JobState;
  }

  number(id: NumberEffectId): EffectState<number> {
    return this.pools.numbers.get(id) as EffectState<number>;
  }

  pops(): Enumerable<[PopId, PopState]> {
    return new Enumerable(this.pools.pops.entries());
  }

  recipe(id: RecipeId): RecipeState {
    return this.pools.recipes.get(id) as RecipeState;
  }

  sections() {
    return this.pools.sections;
  }

  section(id: SectionId): SectionState {
    return this.pools.sections.get(id) as SectionState;
  }

  stockpile(id: StockpileId): StockpileState {
    return this.pools.stockpiles.get(id) as StockpileState;
  }

  techs(): Enumerable<TechId> {
    return new Enumerable(this.pools.techs.keys());
  }

  tech(id: TechId): TechState {
    return this.pools.techs.get(id) as TechState;
  }

  effectTree(): EffectTreeState {
    const pool = this.pools.ensure("singletons");
    return pool.get("effect-tree") as unknown as EffectTreeState;
  }

  environment(): EnvironmentState {
    const pool = this.pools.ensure("singletons");
    return pool.get("environment") as unknown as EnvironmentState;
  }

  player(): PlayerState {
    const pool = this.pools.ensure("singletons");
    return pool.get("player") as unknown as PlayerState;
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

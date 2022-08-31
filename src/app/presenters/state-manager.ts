import { reactive } from "vue";

import { getOrAdd } from "@/app/utils/collections";
import { Enumerable } from "@/app/utils/enumerable";

import {
  IPresenterChangeSink,
  JobId,
  PoolId,
  PopId,
  PropertyBag,
  RecipeId,
  TechId,
  StockpileId,
} from "@/app/interfaces";
import { Channel } from "@/app/presenters/common/channel";
import {
  HistoryEvent,
  JobState,
  PlayerState,
  PopState,
  RecipeState,
  StockpileState,
  TechState,
} from "@/app/state";
import {
  addState,
  changeState,
  removeState,
  ComponentDeltas,
  StateSchema,
  EventSourceId,
} from "@/app/game/systems2/core";

export interface IStateManager {
  state: StateSchema;
  events: IEventPools;

  jobs(): Enumerable<[JobId, JobState]>;
  job(id: JobId): JobState;

  pops(): Enumerable<[PopId, PopState]>;

  recipe(id: RecipeId): RecipeState;

  stockpile(id: StockpileId): StockpileState;

  techs(): Enumerable<TechId>;
  tech(id: TechId): TechState;

  player(): PlayerState;
}

class MutationPools extends Map<PoolId, Map<string, PropertyBag>> {
  get jobs(): Map<JobId, JobState> {
    return this.ensure("jobs") as unknown as Map<JobId, JobState>;
  }

  get pops(): Map<PopId, PopState> {
    return this.ensure("pops") as unknown as Map<PopId, PopState>;
  }

  get recipes(): Map<RecipeId, RecipeState> {
    return this.ensure("recipes") as unknown as Map<RecipeId, RecipeState>;
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

interface IEventPools {
  get history(): Channel<HistoryEvent>;
}

class EventPools extends Map<EventSourceId, Channel> implements IEventPools {
  get history(): Channel<HistoryEvent> {
    return this.ensure("history") as Channel<HistoryEvent>;
  }

  ensure(id: EventSourceId): Channel {
    return getOrAdd(this, id, () => new Channel());
  }
}

export class StateManager implements IPresenterChangeSink, IStateManager {
  readonly state: StateSchema;
  readonly events: EventPools;

  private readonly pools: MutationPools;

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

    const sinks = Object.entries(deltas.events);
    if (sinks.length > 0) {
      console.log("Events", sinks);
      for (const [id, events] of sinks) {
        this.events.ensure(id as EventSourceId).push(events);
      }
    }
  }

  jobs(): Enumerable<[JobId, JobState]> {
    return new Enumerable(this.pools.jobs.entries());
  }

  job(id: JobId): JobState {
    return this.pools.jobs.get(id) as JobState;
  }

  pops(): Enumerable<[PopId, PopState]> {
    return new Enumerable(this.pools.pops.entries());
  }

  recipe(id: RecipeId): RecipeState {
    return this.pools.recipes.get(id) as RecipeState;
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

  player(): PlayerState {
    const pool = this.pools.ensure("singletons");
    return pool.get("player") as unknown as PlayerState;
  }
}

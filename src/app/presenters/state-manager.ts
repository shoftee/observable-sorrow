import { mergeWith } from "lodash";
import { reactive } from "vue";

import {
  BuildingId,
  ChangePool,
  EffectUnits,
  IPresenterChangeSink,
  JobId,
  NumberEffectId,
  PoolEntityId,
  PopId,
  PropertyBag,
  RecipeId,
  ResourceId,
  SectionId,
  TechnologyId,
  UnitKind,
} from "@/app/interfaces";
import {
  BuildingState,
  EnvironmentState,
  JobState,
  NumberEffectState,
  PlayerState,
  PopState,
  RecipeState,
  ResourceState,
  SectionState,
  SocietyState,
  TechnologyState,
  TimeState,
} from "@/app/state";
import { asEnumerable, Enumerable } from "@/app/utils/enumerable";
import { ShowSign } from "@/app/utils/notation";

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

  technologies(): Enumerable<TechnologyId>;
  technology(id: TechnologyId): TechnologyState;

  environment(): EnvironmentState;
  player(): PlayerState;
  society(): SocietyState;
  time(): TimeState;
}

export interface NumberView {
  value: number;
  unit: UnitKind;
  rounded?: boolean;
  showSign?: ShowSign;
}

class ChangePools extends Map<
  PoolEntityId | undefined,
  Map<string, PropertyBag>
> {
  get buildings(): Map<BuildingId, BuildingState> {
    return this.getOrAdd("buildings") as unknown as Map<
      BuildingId,
      BuildingState
    >;
  }

  get jobs(): Map<JobId, JobState> {
    return this.getOrAdd("jobs") as unknown as Map<JobId, JobState>;
  }

  get numbers(): Map<NumberEffectId, NumberEffectState> {
    return this.getOrAdd("numbers") as unknown as Map<
      NumberEffectId,
      NumberEffectState
    >;
  }

  get pops(): Map<PopId, PopState> {
    return this.getOrAdd("pops") as unknown as Map<PopId, PopState>;
  }

  get recipes(): Map<RecipeId, RecipeState> {
    return this.getOrAdd("recipes") as unknown as Map<RecipeId, RecipeState>;
  }

  get resources(): Map<ResourceId, ResourceState> {
    return this.getOrAdd("resources") as unknown as Map<
      ResourceId,
      ResourceState
    >;
  }

  get sections(): Map<SectionId, SectionState> {
    return this.getOrAdd("sections") as unknown as Map<SectionId, SectionState>;
  }

  get technologies(): Map<TechnologyId, TechnologyState> {
    return this.getOrAdd("technologies") as unknown as Map<
      TechnologyId,
      TechnologyState
    >;
  }

  getOrAdd(id: PoolEntityId | undefined): Map<string, PropertyBag> {
    let existing = this.get(id);
    if (!existing) {
      existing = reactive(new Map<string, PropertyBag>());
      this.set(id, existing);
    }
    return existing;
  }
}

export class StateManager implements IPresenterChangeSink, IStateManager {
  private readonly pools: ChangePools;

  constructor() {
    this.pools = new ChangePools();
  }

  update(changes: Iterable<ChangePool>): void {
    for (const pool of changes) {
      const values = this.pools.getOrAdd(pool.poolId);
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

  buildings(): Enumerable<[BuildingId, BuildingState]> {
    return asEnumerable(this.pools.buildings.entries());
  }

  building(id: BuildingId): BuildingState {
    return this.pools.buildings.get(id) as BuildingState;
  }

  numberView(id: NumberEffectId): NumberView {
    const number = this.pools.numbers.get(id) as NumberEffectState;
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
    const pool = this.pools.getOrAdd("sections");
    return pool.get(id) as unknown as SectionState;
  }

  technologies(): Enumerable<TechnologyId> {
    return asEnumerable(this.pools.technologies.keys());
  }

  technology(id: TechnologyId): TechnologyState {
    const pool = this.pools.getOrAdd("technologies");
    return pool.get(id) as unknown as TechnologyState;
  }

  environment(): EnvironmentState {
    const pool = this.pools.getOrAdd(undefined);
    return pool.get("environment") as unknown as EnvironmentState;
  }

  player(): PlayerState {
    const pool = this.pools.getOrAdd(undefined);
    return pool.get("player") as unknown as PlayerState;
  }

  society(): SocietyState {
    const pool = this.pools.getOrAdd(undefined);
    return pool.get("society") as unknown as SocietyState;
  }

  time(): TimeState {
    const pool = this.pools.getOrAdd(undefined);
    return pool.get("time") as unknown as TimeState;
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

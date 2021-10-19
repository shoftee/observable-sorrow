import { mergeWith } from "lodash";
import { computed, ComputedRef, reactive } from "vue";

import {
  BuildingId,
  ChangePool,
  EffectId,
  EffectUnits,
  EntityId,
  IPresenterChangeSink,
  PoolEntityId,
  PopId,
  PropertyBag,
  RecipeId,
  ResourceId,
  UnitKind,
} from "@/_interfaces";
import {
  BuildingState,
  EffectState,
  EnvironmentState,
  SocietyState,
  RecipeState,
  ResourceState,
  PopState,
  PlayerState,
  TimeState,
} from "@/_state";
import { asEnumerable, Enumerable } from "@/_utils/enumerable";
import { ShowSign } from "@/_utils/notation";

export interface IStateManager {
  buildings(): Enumerable<[BuildingId, BuildingState]>;
  building(id: BuildingId): BuildingState;

  effects(): Enumerable<[EffectId, EffectState]>;
  effect(id: EffectId): EffectState;

  pops(): Enumerable<[PopId, PopState]>;

  recipes(): Enumerable<[RecipeId, RecipeState]>;
  recipe(id: RecipeId): RecipeState;

  resources(): Enumerable<[ResourceId, ResourceState]>;
  resource(id: ResourceId): ResourceState;

  environment(): EnvironmentState;
  player(): PlayerState;
  society(): SocietyState;
  time(): TimeState;

  effectView(id: EffectId): ComputedRef<NumberView>;
}

export interface NumberView {
  value: number;
  unit: UnitKind;
  rounded?: boolean;
  showSign?: ShowSign;
}

class ChangePools extends Map<
  PoolEntityId | undefined,
  Map<EntityId, PropertyBag>
> {
  get buildings(): Map<BuildingId, BuildingState> {
    return this.getOrAdd("buildings") as unknown as Map<
      BuildingId,
      BuildingState
    >;
  }

  get effects(): Map<EffectId, EffectState> {
    return this.getOrAdd("effects") as unknown as Map<EffectId, EffectState>;
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

  getOrAdd(id: PoolEntityId | undefined): Map<EntityId, PropertyBag> {
    let existing = this.get(id);
    if (!existing) {
      existing = reactive(new Map<EntityId, PropertyBag>());
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

  effects(): Enumerable<[EffectId, EffectState]> {
    return asEnumerable(this.pools.effects.entries());
  }

  effect(id: EffectId): EffectState {
    return this.pools.effects.get(id) as EffectState;
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

  effectView(id: EffectId): ComputedRef<NumberView> {
    return computed(() => ({
      value: this.effect(id).value ?? 0,
      unit: EffectUnits[id] ?? UnitKind.None,
      rounded: false,
      showSign: "always",
    }));
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

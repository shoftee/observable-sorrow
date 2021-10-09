import { mergeWith } from "lodash";
import { computed, ComputedRef, reactive } from "vue";

import {
  BuildingId,
  EffectId,
  IPresenterChangeSink,
  PropertyBag,
  RecipeId,
  ResourceId,
} from "@/_interfaces";
import {
  BuildingState,
  EffectState,
  EffectUnits,
  EnvironmentState,
  RecipeState,
  ResourceState,
  UnitKind,
} from "@/_state";

export interface IStateManager {
  building(id: BuildingId): BuildingState;
  effect(id: EffectId): EffectState;
  environment(): EnvironmentState;
  recipe(id: RecipeId): RecipeState;
  resource(id: ResourceId): ResourceState;

  effectView(id: EffectId): ComputedRef<EffectView>;
}

export interface EffectView {
  value: number;
  unit: UnitKind;
}

export class StateManager implements IPresenterChangeSink, IStateManager {
  private readonly values: Map<string, PropertyBag>;

  constructor() {
    this.values = new Map<string, PropertyBag>();
  }

  update(changes: Map<string, PropertyBag>): void {
    for (const [key, value] of changes) {
      const updated = updateObject(value, this.values.get(key));
      this.values.set(key, updated);
    }
  }

  building(id: BuildingId): BuildingState {
    return this.values.get(id) as unknown as BuildingState;
  }

  effect(id: EffectId): EffectState {
    return this.values.get(id) as unknown as EffectState;
  }

  environment(): EnvironmentState {
    return this.values.get("environment") as unknown as EnvironmentState;
  }

  recipe(id: RecipeId): RecipeState {
    return this.values.get(id) as unknown as RecipeState;
  }

  resource(id: ResourceId): ResourceState {
    return this.values.get(id) as unknown as ResourceState;
  }

  effectView(id: EffectId): ComputedRef<EffectView> {
    return computed(() => ({
      value: this.effect(id).value ?? 0,
      unit: EffectUnits[id] ?? UnitKind.None,
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

import { mergeWith } from "lodash";
import { computed, ComputedRef, reactive } from "vue";

import {
  BuildingId,
  EffectId,
  EffectUnits,
  IPresenterChangeSink,
  PropertyBag,
  RecipeId,
  ResourceId,
  UnitKind,
} from "@/_interfaces";
import {
  BuildingState,
  EffectState,
  EnvironmentState,
  PopulationState,
  RecipeState,
  ResourceState,
} from "@/_state";
import { ShowSign } from "@/_utils/notation";

export interface IStateManager {
  building(id: BuildingId): BuildingState;
  effect(id: EffectId): EffectState;
  environment(): EnvironmentState;
  recipe(id: RecipeId): RecipeState;
  resource(id: ResourceId): ResourceState;
  population(): PopulationState;

  effectView(id: EffectId): ComputedRef<NumberView>;
}

export interface NumberView {
  value: number;
  unit: UnitKind;
  rounded?: boolean;
  showSign?: ShowSign;
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

  population(): PopulationState {
    return this.values.get("population") as unknown as PopulationState;
  }

  recipe(id: RecipeId): RecipeState {
    return this.values.get(id) as unknown as RecipeState;
  }

  resource(id: ResourceId): ResourceState {
    return this.values.get(id) as unknown as ResourceState;
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

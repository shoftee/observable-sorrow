import { mergeWith } from "lodash";
import { computed, ComputedRef, reactive } from "vue";

import {
  BuildingId,
  EffectId,
  EffectUnits,
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
} from "@/_state";
import { ShowSign } from "@/_utils/notation";

import { EntityId } from "../entity";
import {
  ChangesBag,
  IPresenterChangeSink,
  PropertyBag,
} from "../game/endpoint";

export interface IStateManager {
  building(id: BuildingId): BuildingState;
  effect(id: EffectId): EffectState;
  environment(): EnvironmentState;
  recipe(id: RecipeId): RecipeState;
  resource(id: ResourceId): ResourceState;
  society(): SocietyState;

  effectView(id: EffectId): ComputedRef<NumberView>;
}

export interface NumberView {
  value: number;
  unit: UnitKind;
  rounded?: boolean;
  showSign?: ShowSign;
}

export class StateManager implements IPresenterChangeSink, IStateManager {
  private readonly values: Map<EntityId, PropertyBag>;

  constructor() {
    this.values = new Map<EntityId, PropertyBag>();
  }

  update(changes: ChangesBag): void {
    for (const [id, state] of changes.added) {
      this.values.set(id as EntityId, reactive(state));
    }
    for (const [id, state] of changes.updated) {
      updateObject(state, this.values.get(id as EntityId));
    }
    for (const id of changes.removed) {
      this.values.delete(id as EntityId);
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

  society(): SocietyState {
    return this.values.get("society") as unknown as SocietyState;
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

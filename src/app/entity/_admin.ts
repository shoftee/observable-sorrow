import { BuildingId, EffectId, RecipeId, ResourceId } from "@/_interfaces";

import {
  RecipeEntity,
  ResourceEntity,
  BuildingEntity,
  EnvironmentEntity,
  TimeEntity,
  EffectEntity,
  BuildingsPool,
  EffectsPool,
  RecipesPool,
  ResourcesPool,
  Watcher,
} from ".";
import { SocietyEntity as SocietyEntity } from "./society";

export class EntityAdmin {
  private readonly _buildings: BuildingsPool;
  private readonly _effects: EffectsPool;
  private readonly _recipes: RecipesPool;
  private readonly _resources: ResourcesPool;

  private readonly _environment: EnvironmentEntity;
  private readonly _society: SocietyEntity;
  private readonly _time: TimeEntity;

  constructor(private readonly watcher: Watcher) {
    this._buildings = new BuildingsPool(this.watcher);
    this._effects = new EffectsPool(this.watcher);
    this._recipes = new RecipesPool(this.watcher);
    this._resources = new ResourcesPool(this.watcher);

    this._environment = new EnvironmentEntity();
    this._environment.watch(this.watcher);

    this._society = new SocietyEntity();
    this._society.watch(this.watcher);

    this._time = new TimeEntity();
  }

  recipe(id: RecipeId): RecipeEntity {
    return this._recipes.get(id);
  }

  recipes(): Iterable<RecipeEntity> {
    return this._recipes.all();
  }

  resource(id: ResourceId): ResourceEntity {
    return this._resources.get(id);
  }

  resources(): Iterable<ResourceEntity> {
    return this._resources.all();
  }

  building(id: BuildingId): BuildingEntity {
    return this._buildings.get(id);
  }

  buildings(): Iterable<BuildingEntity> {
    return this._buildings.all();
  }

  effect(id: EffectId): EffectEntity {
    return this._effects.get(id);
  }

  effects(): Iterable<EffectEntity> {
    return this._effects.all();
  }

  environment(): EnvironmentEntity {
    return this._environment;
  }

  time(): TimeEntity {
    return this._time;
  }

  society(): SocietyEntity {
    return this._society;
  }
}

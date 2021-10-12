import { BuildingId, EffectId, RecipeId, ResourceId } from "@/_interfaces";

import {
  RecipeEntity,
  ResourceEntity,
  BuildingEntity,
  EnvironmentEntity,
  EntityWatcher,
  TimeEntity,
  EffectEntity,
  BuildingsPool,
  EffectsPool,
  RecipesPool,
  ResourcesPool,
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

  constructor(private readonly watcher: EntityWatcher) {
    this._buildings = this.watcher.watch(new BuildingsPool(this.watcher));
    this._effects = this.watcher.watch(new EffectsPool(this.watcher));
    this._recipes = this.watcher.watch(new RecipesPool(this.watcher));
    this._resources = this.watcher.watch(new ResourcesPool(this.watcher));
    this._environment = this.watcher.watch(new EnvironmentEntity());
    this._society = this.watcher.watch(new SocietyEntity());
    this._time = this.watcher.watch(new TimeEntity());
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

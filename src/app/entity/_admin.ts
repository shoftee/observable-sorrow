import { BuildingId, EffectId, RecipeId, ResourceId } from "@/_interfaces";

import {
  BuildingEntity,
  BuildingsPool,
  EffectEntity,
  EffectsPool,
  EntityWatcher,
  EnvironmentEntity,
  PopsPool,
  RecipeEntity,
  RecipesPool,
  ResourceEntity,
  ResourcesPool,
  PlayerEntity,
  SocietyEntity,
  TimeEntity,
} from ".";

export class EntityAdmin {
  private readonly _buildings: BuildingsPool;
  private readonly _effects: EffectsPool;
  private readonly _recipes: RecipesPool;
  private readonly _resources: ResourcesPool;
  private readonly _pops: PopsPool;

  private readonly _environment: EnvironmentEntity;
  private readonly _player: PlayerEntity;
  private readonly _society: SocietyEntity;
  private readonly _time: TimeEntity;

  constructor(private readonly watcher: EntityWatcher) {
    this._buildings = new BuildingsPool(this.watcher.pooled("buildings"));
    this._effects = new EffectsPool(this.watcher.pooled("effects"));
    this._recipes = new RecipesPool(this.watcher.pooled("recipes"));
    this._resources = new ResourcesPool(this.watcher.pooled("resources"));
    this._pops = new PopsPool(this.watcher.pooled("pops"));

    this._environment = new EnvironmentEntity();
    this._environment.watch(this.watcher);

    this._player = new PlayerEntity();
    this._player.watch(this.watcher);

    this._society = new SocietyEntity();
    this._society.watch(this.watcher);

    this._time = new TimeEntity();
    this._time.watch(this.watcher);
  }

  building(id: BuildingId): BuildingEntity {
    return this._buildings.get(id);
  }

  buildings(): Iterable<BuildingEntity> {
    return this._buildings.enumerate();
  }

  effect(id: EffectId): EffectEntity {
    return this._effects.get(id);
  }

  effects(): Iterable<EffectEntity> {
    return this._effects.enumerate();
  }

  pops(): PopsPool {
    return this._pops;
  }

  recipe(id: RecipeId): RecipeEntity {
    return this._recipes.get(id);
  }

  recipes(): Iterable<RecipeEntity> {
    return this._recipes.enumerate();
  }

  resource(id: ResourceId): ResourceEntity {
    return this._resources.get(id);
  }

  resources(): Iterable<ResourceEntity> {
    return this._resources.enumerate();
  }

  environment(): EnvironmentEntity {
    return this._environment;
  }

  player(): PlayerEntity {
    return this._player;
  }

  society(): SocietyEntity {
    return this._society;
  }

  time(): TimeEntity {
    return this._time;
  }
}

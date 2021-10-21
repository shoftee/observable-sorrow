import { BuildingId, EffectId, RecipeId, ResourceId } from "@/app/interfaces";
import { SaveState } from "@/app/store";

import {
  BuildingEntity,
  BuildingsPool,
  EffectEntity,
  EffectsPool,
  EntityWatcher,
  EnvironmentEntity,
  RecipeEntity,
  RecipesPool,
  ResourceEntity,
  ResourcesPool,
  PlayerEntity,
  PopsPool,
  PrngEntity,
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
  private readonly _prng: PrngEntity;
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

    this._prng = new PrngEntity();

    this._society = new SocietyEntity();
    this._society.watch(this.watcher);

    this._time = new TimeEntity();
    this._time.watch(this.watcher);
  }

  loadState(state: SaveState): void {
    this._buildings.loadState(state);
    this._resources.loadState(state);
    this._pops.loadState(state);
    this._environment.loadState(state);
    this._player.loadState(state);
    this._prng.loadState(state);
    this._society.loadState(state);
    this._time.loadState(state);
  }

  saveState(state: SaveState): void {
    this._buildings.saveState(state);
    this._resources.saveState(state);
    this._pops.saveState(state);
    this._environment.saveState(state);
    this._player.saveState(state);
    this._prng.saveState(state);
    this._society.saveState(state);
    this._time.saveState(state);
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

  prng(): PrngEntity {
    return this._prng;
  }

  society(): SocietyEntity {
    return this._society;
  }

  time(): TimeEntity {
    return this._time;
  }
}

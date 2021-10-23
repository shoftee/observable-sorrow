import {
  BooleanEffectId,
  BuildingId,
  JobId,
  NumberEffectId,
  RecipeId,
  ResourceId,
  SectionId,
  TechnologyId,
} from "@/app/interfaces";
import { SaveState } from "@/app/store";

import {
  BooleanEffectEntity,
  BooleanEffectsPool,
  BuildingEntity,
  BuildingsPool,
  Entity,
  EntityWatcher,
  EnvironmentEntity,
  JobEntity,
  JobsPool,
  NumberEffectEntity,
  NumberEffectsPool,
  PlayerEntity,
  PopsPool,
  PrngEntity,
  RecipeEntity,
  RecipesPool,
  ResourceEntity,
  ResourcesPool,
  SectionEntity,
  SectionsPool,
  SocietyEntity,
  TechnologiesPool,
  TechnologyEntity,
  TimeEntity,
} from ".";

export class EntityAdmin {
  private readonly _buildings: BuildingsPool;
  private readonly _jobs: JobsPool;
  private readonly _numbers: NumberEffectsPool;
  private readonly _booleans: BooleanEffectsPool;
  private readonly _pops: PopsPool;
  private readonly _recipes: RecipesPool;
  private readonly _resources: ResourcesPool;
  private readonly _sections: SectionsPool;
  private readonly _technologies: TechnologiesPool;

  private readonly _environment: EnvironmentEntity;
  private readonly _player: PlayerEntity;
  private readonly _prng: PrngEntity;
  private readonly _society: SocietyEntity;
  private readonly _time: TimeEntity;

  constructor(private readonly watcher: EntityWatcher) {
    this._booleans = new BooleanEffectsPool(this.watcher.pooled("booleans"));
    this._buildings = new BuildingsPool(this.watcher.pooled("buildings"));
    this._jobs = new JobsPool(this.watcher.pooled("jobs"));
    this._numbers = new NumberEffectsPool(this.watcher.pooled("numbers"));
    this._pops = new PopsPool(this.watcher.pooled("pops"));
    this._recipes = new RecipesPool(this.watcher.pooled("recipes"));
    this._resources = new ResourcesPool(this.watcher.pooled("resources"));
    this._sections = new SectionsPool(this.watcher.pooled("sections"));
    this._technologies = new TechnologiesPool(
      this.watcher.pooled("technologies"),
    );

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
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        const element = this[key];
        if (element instanceof Entity) {
          element.loadState?.(state);
        }
      }
    }
  }

  saveState(state: SaveState): void {
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        const element = this[key];
        if (element instanceof Entity) {
          element.saveState?.(state);
        }
      }
    }
  }

  booleans(): Iterable<BooleanEffectEntity> {
    return this._booleans.enumerate();
  }

  boolean(id: BooleanEffectId): BooleanEffectEntity {
    return this._booleans.get(id);
  }

  building(id: BuildingId): BuildingEntity {
    return this._buildings.get(id);
  }

  buildings(): Iterable<BuildingEntity> {
    return this._buildings.enumerate();
  }

  job(id: JobId): JobEntity {
    return this._jobs.get(id);
  }

  jobs(): Iterable<JobEntity> {
    return this._jobs.enumerate();
  }

  number(id: NumberEffectId): NumberEffectEntity {
    return this._numbers.get(id);
  }

  numbers(): Iterable<NumberEffectEntity> {
    return this._numbers.enumerate();
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

  section(id: SectionId): SectionEntity {
    return this._sections.get(id);
  }

  sections(): Iterable<SectionEntity> {
    return this._sections.enumerate();
  }

  technology(id: TechnologyId): TechnologyEntity {
    return this._technologies.get(id);
  }

  technologies(): Iterable<TechnologyEntity> {
    return this._technologies.enumerate();
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

import {
  BooleanEffectId,
  BuildingId,
  FulfillmentId,
  JobId,
  NumberEffectId,
  RecipeId,
  ResourceId,
  SectionId,
  StockpileId,
  TechId,
} from "@/app/interfaces";
import { SaveState } from "@/app/store";
import { Enumerable } from "@/app/utils/enumerable";

import {
  BooleanEffectEntity,
  BooleanEffectsPool,
  BuildingEntity,
  BuildingsPool,
  EffectTreeEntity,
  EntityWatcher,
  EnvironmentEntity,
  FulfillmentsPool,
  FulfillmentEntity,
  HistoryEntity,
  JobEntity,
  JobsPool,
  Loaded,
  NumberEffectEntity,
  NumberEffectsPool,
  PlayerEntity,
  PopsPool,
  PrngEntity,
  RecipeEntity,
  RecipesPool,
  ResourceEntity,
  ResourcesPool,
  Saved,
  SectionEntity,
  SectionsPool,
  StockpileEntity,
  StockpilesPool,
  TechsPool,
  TechEntity,
  TimeEntity,
  TransactionsEntity,
} from ".";

export class EntityAdmin {
  // pooled entities
  private readonly _booleans: BooleanEffectsPool;
  private readonly _buildings: BuildingsPool;
  private readonly _fulfillments: FulfillmentsPool;
  private readonly _jobs: JobsPool;
  private readonly _numbers: NumberEffectsPool;
  private readonly _pops: PopsPool;
  private readonly _recipes: RecipesPool;
  private readonly _resources: ResourcesPool;
  private readonly _sections: SectionsPool;
  private readonly _stockpiles: StockpilesPool;
  private readonly _techs: TechsPool;

  // singleton entities
  private readonly _effectTree: EffectTreeEntity;
  private readonly _environment: EnvironmentEntity;
  private readonly _player: PlayerEntity;
  private readonly _time: TimeEntity;
  private readonly _prng: PrngEntity;

  // channels
  private readonly _history: HistoryEntity;

  // other
  private readonly _transactions: TransactionsEntity;

  constructor(private readonly watcher: EntityWatcher) {
    this._booleans = new BooleanEffectsPool(this.watcher.pooled("booleans"));
    this._buildings = new BuildingsPool(this.watcher.pooled("buildings"));
    this._fulfillments = new FulfillmentsPool(
      this.watcher.pooled("fulfillments"),
    );
    this._jobs = new JobsPool(this.watcher.pooled("jobs"));
    this._numbers = new NumberEffectsPool(this.watcher.pooled("numbers"));
    this._pops = new PopsPool(this.watcher.pooled("pops"));
    this._recipes = new RecipesPool(this.watcher.pooled("recipes"));
    this._resources = new ResourcesPool(this.watcher.pooled("resources"));
    this._sections = new SectionsPool(this.watcher.pooled("sections"));
    this._stockpiles = new StockpilesPool(this.watcher.pooled("stockpiles"));
    this._techs = new TechsPool(this.watcher.pooled("techs"));

    this._effectTree = new EffectTreeEntity();
    this._effectTree.watch(this.watcher.pooled());

    this._environment = new EnvironmentEntity();
    this._environment.watch(this.watcher.pooled());

    this._player = new PlayerEntity();
    this._player.watch(this.watcher.pooled());

    this._time = new TimeEntity();
    this._time.watch(this.watcher.pooled());

    this._history = new HistoryEntity(this.watcher.buffered("history"));

    // entities without watch logic:
    this._prng = new PrngEntity();
    this._transactions = new TransactionsEntity();
  }

  loadState(state: SaveState): void {
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        const element = this[key] as Partial<Loaded>;
        if (element.loadState) {
          element.loadState(state);
        }
      }
    }
  }

  saveState(state: SaveState): void {
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        const element = this[key] as Partial<Saved>;
        if (element.saveState) {
          element.saveState(state);
        }
      }
    }
  }

  booleans(): Enumerable<BooleanEffectEntity> {
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

  fulfillments(): Iterable<FulfillmentEntity> {
    return this._fulfillments.enumerate();
  }

  fulfillment(id: FulfillmentId): FulfillmentEntity {
    return this._fulfillments.get(id);
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

  numbers(): Enumerable<NumberEffectEntity> {
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

  stockpile(id: StockpileId): StockpileEntity {
    return this._stockpiles.get(id);
  }

  tech(id: TechId): TechEntity {
    return this._techs.get(id);
  }

  techs(): Iterable<TechEntity> {
    return this._techs.enumerate();
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

  effectTree(): EffectTreeEntity {
    return this._effectTree;
  }

  time(): TimeEntity {
    return this._time;
  }

  transactions(): TransactionsEntity {
    return this._transactions;
  }

  history(): HistoryEntity {
    return this._history;
  }
}

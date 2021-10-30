import { EntityAdmin } from "../entity";

import {
  System,
  BuildingSystem,
  CraftingSystem,
  EffectsSystem,
  EnvironmentSystem,
  FulfillmentSystem,
  LockToggleSystem,
  PopulationSystem,
  ResearchSystem,
  ResourceAmountsSystem,
  ResourceLimitsSystem,
  TimeSystem,
  SectionsSystem,
  AstronomySystem,
} from ".";

export class GameSystems {
  private readonly astronomy: AstronomySystem;
  private readonly buildings: BuildingSystem;
  private readonly crafting: CraftingSystem;
  private readonly effects: EffectsSystem;
  private readonly environment: EnvironmentSystem;
  private readonly fulfillment: FulfillmentSystem;
  private readonly lockToggle: LockToggleSystem;
  private readonly population: PopulationSystem;
  private readonly research: ResearchSystem;
  private readonly resourceAmounts: ResourceAmountsSystem;
  private readonly resourceLimits: ResourceLimitsSystem;
  private readonly sections: SectionsSystem;
  private readonly time: TimeSystem;

  constructor(admin: EntityAdmin) {
    this.astronomy = new AstronomySystem(admin);
    this.buildings = new BuildingSystem(admin);
    this.crafting = new CraftingSystem(admin);
    this.effects = new EffectsSystem(admin);
    this.environment = new EnvironmentSystem(admin);
    this.fulfillment = new FulfillmentSystem(admin);
    this.lockToggle = new LockToggleSystem(admin);
    this.population = new PopulationSystem(admin);
    this.research = new ResearchSystem(admin);
    this.resourceAmounts = new ResourceAmountsSystem(admin);
    this.resourceLimits = new ResourceLimitsSystem(admin);
    this.sections = new SectionsSystem(admin);
    this.time = new TimeSystem(admin);
  }

  init(): void {
    for (const system of this.systems()) {
      system.init?.();
    }
  }

  update(dt: number): void {
    // Advance timers
    this.time.update(dt);

    // Update environment.
    this.astronomy.update();
    this.environment.update();

    // Handle orders.
    this.research.update();
    this.buildings.update();
    this.crafting.update();

    // Update effects pool.
    this.effects.update();

    // Update pops.
    this.population.update();

    // Update sections.
    this.sections.update();

    // Update resource limits and apply amount deltas.
    this.resourceLimits.update();
    this.resourceAmounts.update();

    // Handle ingredient counts.
    this.fulfillment.update();

    // Lock/unlock elements.
    this.lockToggle.update();
  }

  private *systems(): IterableIterator<System> {
    for (const key of Object.keys(this)) {
      const property = this[key as keyof GameSystems];
      if (property instanceof System) {
        yield property;
      }
    }
  }
}

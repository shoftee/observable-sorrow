import {
  System,
  BuildingSystem,
  CraftingSystem,
  EffectsSystem,
  EnvironmentSystem,
  FulfillmentSystem,
  LockToggleSystem,
  PopulationSystem,
  ResourceAmountsSystem,
  ResourceLimitsSystem,
  TimeSystem,
} from ".";

export class GameSystems {
  constructor(
    readonly buildings: BuildingSystem,
    readonly crafting: CraftingSystem,
    readonly effects: EffectsSystem,
    readonly environment: EnvironmentSystem,
    readonly fulfillment: FulfillmentSystem,
    readonly lockToggle: LockToggleSystem,
    readonly population: PopulationSystem,
    readonly resourceAmounts: ResourceAmountsSystem,
    readonly resourceLimits: ResourceLimitsSystem,
    readonly time: TimeSystem,
  ) {}

  init(): void {
    for (const system of this.systems()) {
      system.init?.();
    }
  }

  update(dt: number): void {
    // Advance timers
    this.time.update(dt);

    // Update environment.
    this.environment.update();

    // Handle orders.
    this.buildings.update();
    this.crafting.update();

    // Update effects pool.
    this.effects.update();

    // Update pops.
    this.population.update();

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

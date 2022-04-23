import { EntityAdmin } from "../entity";

import {
  System,
  AstronomySystem,
  EffectsSystem,
  EnvironmentSystem,
  FulfillmentSystem,
  LockToggleSystem,
  PopulationSystem,
  ResourceAmountsSystem,
  ResourceLimitsSystem,
  SectionsSystem,
  TimeSystem,
  WorkOrdersSystem,
} from ".";
import {} from "./work-orders";

export class GameSystems {
  private readonly astronomy: AstronomySystem;
  private readonly effects: EffectsSystem;
  private readonly environment: EnvironmentSystem;
  private readonly fulfillment: FulfillmentSystem;
  private readonly lockToggle: LockToggleSystem;
  private readonly population: PopulationSystem;
  private readonly resourceAmounts: ResourceAmountsSystem;
  private readonly resourceLimits: ResourceLimitsSystem;
  private readonly sections: SectionsSystem;
  private readonly time: TimeSystem;
  private readonly workOrders: WorkOrdersSystem;

  constructor(admin: EntityAdmin) {
    this.astronomy = new AstronomySystem(admin);
    this.effects = new EffectsSystem(admin);
    this.environment = new EnvironmentSystem(admin);
    this.fulfillment = new FulfillmentSystem(admin);
    this.lockToggle = new LockToggleSystem(admin);
    this.population = new PopulationSystem(admin);
    this.resourceAmounts = new ResourceAmountsSystem(admin);
    this.resourceLimits = new ResourceLimitsSystem(admin);
    this.sections = new SectionsSystem(admin);
    this.time = new TimeSystem(admin);
    this.workOrders = new WorkOrdersSystem(admin);
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

    // Handle work orders.
    this.workOrders.update();

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

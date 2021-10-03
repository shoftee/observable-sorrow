import {
  System,
  BuildingSystem,
  CraftingSystem,
  EffectsSystem,
  EnvironmentSystem,
  IngredientsSystem,
  LockToggleSystem,
  ResourceProductionSystem,
} from ".";

export class GameSystems {
  constructor(
    readonly buildings: BuildingSystem,
    readonly crafting: CraftingSystem,
    readonly effects: EffectsSystem,
    readonly environment: EnvironmentSystem,
    readonly ingredients: IngredientsSystem,
    readonly lockToggle: LockToggleSystem,
    readonly resourceProduction: ResourceProductionSystem,
  ) {}

  init(): void {
    for (const system of this.systems()) {
      if (system.init) {
        system.init();
      }
    }
  }

  update(): void {
    // Update environment.
    this.environment.update();

    // Handle orders.
    this.buildings.update();
    this.crafting.update();

    // Update effects pool.
    this.effects.update();

    // Handle resource deltas.
    this.resourceProduction.update();

    // Handle ingredient counts.
    this.ingredients.update();

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

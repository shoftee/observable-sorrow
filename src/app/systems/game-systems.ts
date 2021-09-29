import { System } from "../ecs";

import {
  BuildingSystem,
  BuildingEffectsSystem,
  CraftingSystem,
  EffectsSystem,
  EnvironmentSystem,
  LockToggleSystem,
  ResourceProductionSystem,
} from ".";

export class GameSystems {
  constructor(
    readonly buildings: BuildingSystem,
    readonly buildingEffects: BuildingEffectsSystem,
    readonly crafting: CraftingSystem,
    readonly effects: EffectsSystem,
    readonly environment: EnvironmentSystem,
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

  private *systems(): IterableIterator<System> {
    for (const key of Object.keys(this)) {
      const property = this[key as keyof GameSystems];
      if (property instanceof System) {
        yield property;
      }
    }
  }
}

import {
  BuildingSystem,
  BuildingEffectsSystem,
  CraftingSystem,
  EnvironmentSystem,
  LockToggleSystem,
  ResourceProductionSystem,
  TransactionSystem,
} from ".";

export class GameSystems {
  constructor(
    readonly buildings: BuildingSystem,
    readonly buildingEffects: BuildingEffectsSystem,
    readonly crafting: CraftingSystem,
    readonly environment: EnvironmentSystem,
    readonly lockToggle: LockToggleSystem,
    readonly resourceProduction: ResourceProductionSystem,
    readonly transactions: TransactionSystem,
  ) {}
}

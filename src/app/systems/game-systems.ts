import {
  IBuildingSystem,
  ITransactionSystem,
  ICraftingSystem,
  BuildingSystem,
  BuildingEffectsSystem,
  CraftingSystem,
  EnvironmentSystem,
  LockToggleSystem,
  ResourceProductionSystem,
  TransactionSystem,
} from ".";

export interface IGameSystems {
  readonly buildings: IBuildingSystem;
  readonly crafting: ICraftingSystem;
  readonly transactions: ITransactionSystem;
}

export class GameSystems implements IGameSystems {
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

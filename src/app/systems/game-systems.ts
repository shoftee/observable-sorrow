import {
  IBuildingSystem,
  ITransactionSystem,
  ICraftingSystem,
  BuildingSystem,
  BuildingEffectsSystem,
  CalendarSystem,
  CraftingSystem,
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
    readonly calendar: CalendarSystem,
    readonly crafting: CraftingSystem,
    readonly lockToggle: LockToggleSystem,
    readonly resourceProduction: ResourceProductionSystem,
    readonly transactions: TransactionSystem,
  ) {}
}

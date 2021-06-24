import {
  BuildingSystem,
  IBuildingSystem,
  ITransactionSystem,
  TransactionSystem,
  CraftingSystem,
  ICraftingSystem,
  LockToggleSystem,
  TimeSystem,
} from ".";

export interface IGameSystems {
  readonly buildings: IBuildingSystem;
  readonly crafting: ICraftingSystem;
  readonly transactions: ITransactionSystem;
}

export class GameSystems implements IGameSystems {
  constructor(
    readonly buildings: BuildingSystem,
    readonly crafting: CraftingSystem,
    readonly lockToggle: LockToggleSystem,
    readonly time: TimeSystem,
    readonly transactions: TransactionSystem,
  ) {}
}

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
import { ProductionSystem } from "./production";

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
    readonly production: ProductionSystem,
    readonly time: TimeSystem,
    readonly transactions: TransactionSystem,
  ) {}
}

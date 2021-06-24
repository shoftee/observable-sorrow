import { IGameRunner } from "../game";
import { BonfireItemId, BonfireMetadata } from "../core/metadata/bonfire";
import {
  IBuildingSystem,
  ICraftingSystem,
  ITransactionSystem,
} from "../systems";

export interface IBonfireInteractor {
  buildItem(id: BonfireItemId): void;
}

export class BonfireInteractor implements IBonfireInteractor {
  constructor(
    private readonly runner: IGameRunner,
    private readonly buildings: IBuildingSystem,
    private readonly crafting: ICraftingSystem,
    private readonly transactions: ITransactionSystem,
  ) {}

  buildItem(id: BonfireItemId): void {
    const metadata = BonfireMetadata[id];
    switch (metadata.intent.kind) {
      case "gather-catnip":
        this.transactions.giveResource("catnip", metadata.intent.amount);
        break;

      case "refine-catnip":
        this.crafting.order("refine-catnip");
        break;

      case "buy-building":
        this.buildings.order(metadata.intent.buildingId);
        break;
    }

    this.runner.forceUpdate();
  }
}

import { IGameRunner } from "../game";
import { Workshop } from "../workshop/entity";
import { BonfireItemId, BonfireMetadata } from "../core/metadata/bonfire";
import { ResourcePool } from "../resources";
import { BuildingPool } from "../buildings/pool";

export interface IBonfireInteractor {
  buildItem(id: BonfireItemId): void;
}

export class BonfireInteractor implements IBonfireInteractor {
  constructor(
    private readonly runner: IGameRunner,
    private readonly buildings: BuildingPool,
    private readonly resources: ResourcePool,
    private readonly workshop: Workshop,
  ) {}

  buildItem(id: BonfireItemId): void {
    const metadata = BonfireMetadata[id];
    if (metadata.intent.kind == "gather-catnip") {
      this.resources.get("catnip").mutations.give(1);
    } else if (metadata.intent.kind == "refine-catnip") {
      this.workshop.order("refine-catnip");
    } else {
      this.buildings.buy(metadata.intent.buildingId);
    }

    this.runner.forceUpdate();
  }
}

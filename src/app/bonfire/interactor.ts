import { IGameRunner } from "../game";
import { Workshop } from "../workshop/entity";
import {
  BonfireItemId,
  BonfireMetadata,
  BonfireMetadataType,
} from "../core/metadata/bonfire";
import { ResourcePool } from "../resources";

export interface IBonfireInteractor {
  buildItem(id: BonfireItemId): void;
}

export class BonfireInteractor implements IBonfireInteractor {
  constructor(
    private readonly resources: ResourcePool,
    private readonly workshop: Workshop,
    private readonly runner: IGameRunner,
  ) {}

  buildItem(id: BonfireItemId): void {
    if (id == "gather-catnip") {
      this.resources.get("catnip").mutations.debit(1);
    } else if (id == "refine-catnip") {
      this.workshop.order("refine-catnip");
    }

    this.runner.forceUpdate();
  }
}

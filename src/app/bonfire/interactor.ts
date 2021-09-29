import { IBonfireInteractor } from "@/_interfaces/interactor";

import { BonfireItemId } from "../core/metadata";
import { BonfireMetadata } from "../core/metadata/bonfire";
import { EntityAdmin } from "../game/entity-admin";

export class BonfireInteractor implements IBonfireInteractor {
  constructor(private readonly admin: EntityAdmin) {}

  buildItem(id: BonfireItemId): void {
    const metadata = BonfireMetadata[id];
    switch (metadata.intent.kind) {
      case "gather-catnip":
        this.admin.resource("catnip").mutations.give(metadata.intent.amount);
        break;

      case "refine-catnip":
        this.admin.workshop().orders.enqueue("refine-catnip");
        break;

      case "buy-building":
        this.admin.building(metadata.intent.buildingId).buildQueue.construct();
        break;
    }
  }
}

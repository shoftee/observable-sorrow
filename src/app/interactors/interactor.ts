import { BonfireItemId, IBonfireInteractor } from "@/_interfaces";

import { BonfireMetadata } from "@/_state/bonfire";
import { EntityAdmin, OrderStatus } from "../entity";

export class BonfireInteractor implements IBonfireInteractor {
  constructor(private readonly admin: EntityAdmin) {}

  buildItem(id: BonfireItemId): void {
    const metadata = BonfireMetadata[id];
    switch (metadata.intent.kind) {
      case "gather-catnip":
        this.admin.resource("catnip").delta.addDebit(metadata.intent.amount);
        break;

      case "refine-catnip": {
        const entity = this.admin.recipe("refine-catnip");
        if (entity.status === OrderStatus.READY) {
          entity.status = OrderStatus.ORDERED;
        }
        break;
      }

      case "buy-building": {
        const entity = this.admin.building(metadata.intent.buildingId);
        if (entity.status === OrderStatus.READY) {
          entity.status = OrderStatus.ORDERED;
        }
        break;
      }
    }
  }
}

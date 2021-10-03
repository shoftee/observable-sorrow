import { BonfireItemId, IBonfireInteractor } from "@/_interfaces";

import { BonfireMetadata } from "@/_state/bonfire";
import { EntityAdmin } from "../entity";

export class BonfireInteractor implements IBonfireInteractor {
  constructor(private readonly admin: EntityAdmin) {}

  buildItem(id: BonfireItemId): void {
    const metadata = BonfireMetadata[id];
    switch (metadata.intent.kind) {
      case "gather-catnip":
        this.admin.resource("catnip").delta.addDebit(metadata.intent.amount);
        break;

      case "refine-catnip":
        this.admin.recipe("refine-catnip").manualCraft = true;
        break;

      case "buy-building":
        this.admin.building(metadata.intent.buildingId).manualConstruct = true;
        break;
    }
  }
}

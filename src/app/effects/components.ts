import {
  ResourceId,
  ProductionEffectMetadata,
  ProductionEffectId,
} from "../core/metadata";
import { Component } from "../ecs";

export class ProductionEffectComponent extends Component {
  resourceId: ResourceId;
  amount: number;

  constructor(id: ProductionEffectId) {
    super();

    const metadata = ProductionEffectMetadata[id];
    this.resourceId = metadata.resourceId;
    this.amount = metadata.amount;
  }
}

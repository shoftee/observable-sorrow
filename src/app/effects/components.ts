import { ResourceId, ProductionEffectType } from "../core/metadata";
import { Component } from "../ecs";

export class ProductionEffectComponent extends Component {
  resourceId: ResourceId;
  amount: number;

  constructor(proto: ProductionEffectType) {
    super();
    this.resourceId = proto.resourceId;
    this.amount = proto.amount;
  }
}

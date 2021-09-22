import { ProductionEffectComponent } from ".";
import { ProductionEffectId } from "../core/metadata";
import { Entity } from "../ecs";
import { EntityAdmin } from "../game/entity-admin";

export class ProductionEffectEntity extends Entity {
  constructor(admin: EntityAdmin, readonly id: ProductionEffectId) {
    super(admin, id);
  }

  effect!: ProductionEffectComponent;

  init(): void {
    this.effect = this.addComponent(new ProductionEffectComponent(this.id));
  }
}

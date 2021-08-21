import { ProductionEffectComponent } from ".";
import { ProductionEffectId, ProductionEffectMetadata } from "../core/metadata";
import { ChangeTrackedEntity, ComponentState } from "../ecs";
import { EntityAdmin } from "../game/entity-admin";

type State = ComponentState<ProductionEffectComponent>;

export class ProductionEffectEntity extends ChangeTrackedEntity<State> {
  constructor(admin: EntityAdmin, readonly id: ProductionEffectId) {
    super(admin, id);
  }

  effect!: ProductionEffectComponent;

  init(): void {
    this.effect = this.addComponent(
      new ProductionEffectComponent(ProductionEffectMetadata[this.id]),
    );
  }
}

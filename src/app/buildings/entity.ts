import { cloneDeep } from "lodash";

import { ChangeTrackedEntity, ComponentState } from "../ecs";
import { BuildingId, BuildingMetadata } from "../core/metadata";

import { EntityAdmin } from "../game/entity-admin";
import {
  BuildingPriceComponent,
  BuildingEffectComponent,
  BuildingStateComponent,
  BuildQueueComponent,
} from "./components";

type State = ComponentState<BuildingStateComponent>;
type Price = ComponentState<BuildingPriceComponent>;

export class BuildingEntity extends ChangeTrackedEntity<State & Price> {
  buildQueue!: BuildQueueComponent;
  state!: BuildingStateComponent;
  price!: BuildingPriceComponent;
  effects!: BuildingEffectComponent;

  constructor(admin: EntityAdmin, readonly id: BuildingId) {
    super(admin, id);
  }

  init(): void {
    this.price = this.addComponent(new BuildingPriceComponent());
    this.price.ingredients = cloneDeep(
      BuildingMetadata[this.id].effects.prices.ingredients,
    );

    this.effects = this.addComponent(new BuildingEffectComponent());
    this.effects.production = cloneDeep(
      BuildingMetadata[this.id].effects.production,
    );

    this.buildQueue = this.addComponent(new BuildQueueComponent());
    this.state = this.addComponent(new BuildingStateComponent());
  }
}

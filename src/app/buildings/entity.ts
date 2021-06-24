import { cloneDeep } from "lodash";

import { ComponentState, Entity } from "../ecs";
import { ChangeNotifierComponent } from "../ecs/common";
import { BuildingId, BuildingMetadata } from "../core/metadata";

import { EntityAdmin } from "../game/entity-admin";
import {
  BuildingPriceComponent,
  BuildingStateComponent,
  BuildQueueComponent,
} from "./components";

type State = ComponentState<BuildingStateComponent>;
type Price = ComponentState<BuildingPriceComponent>;
type ChangeNotifier = ChangeNotifierComponent<State & Price>;

export class BuildingEntity extends Entity {
  buildQueue!: BuildQueueComponent;
  state!: BuildingStateComponent;
  price!: BuildingPriceComponent;
  changes!: ChangeNotifier;

  constructor(admin: EntityAdmin, readonly id: BuildingId) {
    super(admin, id);
  }

  init(): void {
    this.price = this.addComponent(new BuildingPriceComponent());
    this.price.ingredients = cloneDeep(BuildingMetadata[this.id].ingredients);

    this.buildQueue = this.addComponent(new BuildQueueComponent());
    this.state = this.addComponent(new BuildingStateComponent());
    this.changes = this.addComponent(new ChangeNotifierComponent());
  }
}

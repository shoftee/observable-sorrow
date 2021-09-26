import {
  ChangeTrackedEntity,
  ComponentState,
  CreateChangeTrackingProxy,
} from "../ecs";
import { BuildingId } from "../core/metadata";

import { EntityAdmin } from "../game/entity-admin";
import { BuildingStateComponent, BuildQueueComponent } from "./components";

type State = ComponentState<BuildingStateComponent>;

export class BuildingEntity extends ChangeTrackedEntity<State> {
  readonly buildQueue: BuildQueueComponent;
  readonly state: BuildingStateComponent;

  constructor(admin: EntityAdmin, readonly id: BuildingId) {
    super(admin, id);
    this.buildQueue = this.addComponent(new BuildQueueComponent());
    this.state = CreateChangeTrackingProxy(
      this.addComponent(new BuildingStateComponent(this.id)),
      this.changes,
    );
  }
}

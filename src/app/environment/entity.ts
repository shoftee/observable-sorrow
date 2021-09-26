import {
  ChangeTrackedEntity,
  ComponentState,
  ChangeTrackingProxy,
} from "../ecs";

import { EntityAdmin } from "../game/entity-admin";
import { EnvironmentComponent } from ".";

type State = ComponentState<EnvironmentComponent>;

export class EnvironmentEntity extends ChangeTrackedEntity<State> {
  readonly state: EnvironmentComponent;

  constructor(admin: EntityAdmin, readonly id = "environment") {
    super(admin, id);

    this.state = ChangeTrackingProxy(
      this.addComponent(new EnvironmentComponent()),
      this.changes,
    );
  }
}

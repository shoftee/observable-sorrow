import {
  ChangeTrackedEntity,
  ComponentState,
  CreateChangeTrackingProxy,
} from "../ecs";
import { EnvironmentComponent } from ".";
import { EntityAdmin } from "../game/entity-admin";

type State = ComponentState<EnvironmentComponent>;

export class EnvironmentEntity extends ChangeTrackedEntity<State> {
  state!: EnvironmentComponent;

  constructor(admin: EntityAdmin, readonly id = "environment") {
    super(admin, id);
  }

  init(): void {
    this.state = CreateChangeTrackingProxy(
      this.addComponent(new EnvironmentComponent()),
      this.changes,
    );
  }
}

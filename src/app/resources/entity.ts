import {
  ChangeTrackedEntity,
  ComponentState,
  CreateChangeTrackingProxy,
} from "../ecs";
import { ResourceStateComponent, MutationComponent } from "./components";
import { ResourceId } from "../core/metadata";
import { EntityAdmin } from "../game/entity-admin";

type State = ComponentState<ResourceStateComponent>;

export class ResourceEntity extends ChangeTrackedEntity<State> {
  readonly mutations: MutationComponent;
  readonly state: ResourceStateComponent;

  constructor(admin: EntityAdmin, readonly id: ResourceId) {
    super(admin, id);

    this.mutations = this.addComponent(new MutationComponent());
    this.state = CreateChangeTrackingProxy(
      this.addComponent(new ResourceStateComponent()),
      this.changes,
    );
  }
}

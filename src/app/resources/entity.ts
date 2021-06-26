import { ChangeTrackedEntity, ComponentState } from "../ecs";
import { ResourceStateComponent, MutationComponent } from "./components";
import { ResourceId } from "../core/metadata/resources";
import { EntityAdmin } from "../game/entity-admin";

type State = ComponentState<ResourceStateComponent>;

export class ResourceEntity extends ChangeTrackedEntity<State> {
  mutations!: MutationComponent;
  state!: ResourceStateComponent;

  constructor(admin: EntityAdmin, readonly id: ResourceId) {
    super(admin, id);
  }

  init(): void {
    this.mutations = this.addComponent(new MutationComponent());
    this.state = this.addComponent(new ResourceStateComponent());
  }
}

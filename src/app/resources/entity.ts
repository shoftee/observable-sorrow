import { ComponentState, Entity } from "../ecs";
import { ChangeNotifierComponent } from "../ecs/common";
import { ResourceStateComponent, MutationComponent } from "./components";
import { ResourceId } from "../core/metadata/resources";
import { EntityAdmin } from "../game/entity-admin";

type State = ComponentState<ResourceStateComponent>;
type ChangeNotifier = ChangeNotifierComponent<State>;

export class ResourceEntity extends Entity {
  mutations!: MutationComponent;
  state!: ResourceStateComponent;
  changes!: ChangeNotifier;

  constructor(admin: EntityAdmin, readonly id: ResourceId) {
    super(admin, id);
  }

  init(): void {
    this.mutations = this.addComponent(new MutationComponent());
    this.state = this.addComponent(new ResourceStateComponent());
    this.changes = this.addComponent(new ChangeNotifierComponent());
  }
}

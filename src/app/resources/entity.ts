import { markRaw, ref, Ref } from "vue";
import { ComponentState, Entity } from "../ecs";
import { AmountComponent } from "./amount";
import { ResourceId, ResourceMetadataType } from "./metadata";
import { ResourcePool } from "./pool";

export type AmountState = ComponentState<AmountComponent>;

export class ResourceEntity extends Entity {
  readonly id: ResourceId;
  private readonly pool: ResourcePool;
  private readonly metadata: ResourceMetadataType;

  constructor(pool: ResourcePool, metadata: ResourceMetadataType) {
    super();
    this.id = metadata.id;

    this.pool = pool;
    this.metadata = metadata;
  }

  init(): void {
    this.components.add(new AmountComponent());
  }

  getAmount(): Ref<AmountState> {
    const c = this.components.get<AmountComponent>(AmountComponent);
    return ref(c) as Ref<AmountState>;
  }

  update(_deltaTime: number): void {
    // for (const state of this.states.all()) {
    //   const resource = unref(state);
    //   const limit = this.metadata.limits[resource.id];
    //   if (limit !== undefined) {
    //     resource.capacity = limit.base;
    //   }
    // }
  }
}

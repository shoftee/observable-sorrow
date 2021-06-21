import { asEnumerable } from "linq-es2015";
import { Ref, ref, unref } from "vue";
import { ResourceId, ResourceMetadataType, ResourcePoolEntity } from ".";
import { Resolver } from "../core";
import { IEntity, IInit, IRender } from "../ecs";
import { ResourceEntity } from "./entity";
import { ResourceMetadata } from "./metadata";

export interface IResourcePresenter {
  readonly unlocked: Ref<Map<ResourceId, ListItem>>;
}

export class ResourcePresenter implements IResourcePresenter, IInit, IRender {
  private pool!: ResourcePoolEntity;
  private metadata!: Record<ResourceId, ResourceMetadataType>;

  readonly unlocked: Ref<Map<ResourceId, ListItem>>;

  constructor() {
    this.unlocked = ref(new Map<ResourceId, ListItem>()) as Ref<
      Map<ResourceId, ListItem>
    >;
  }

  init(resolver: Resolver<IEntity>): void {
    this.metadata = ResourceMetadata;

    this.pool = resolver.get("resource-pool", ResourcePoolEntity);
  }

  render(): void {
    const vm = unref(this.unlocked);

    const newIds = new Set<ResourceId>();
    const updatedIds = new Set<ResourceId>();
    const deletedIds = new Set<ResourceId>();

    const entities = asEnumerable(
      this.pool.all((e) => e.amount.unlocked),
    ).ToMap(
      (e) => e.id,
      (e) => e,
    );

    for (const entity of entities.values()) {
      if (!vm.has(entity.id)) {
        newIds.add(entity.id);
      } else if (entity.changed) {
        updatedIds.add(entity.id);
      }
    }

    for (const [key] of vm) {
      if (!entities.has(key)) {
        deletedIds.add(key);
      }
    }

    // update resource properties
    for (const key of vm.keys() as Iterable<ResourceId>) {
      if (updatedIds.has(key)) {
        vm.set(key, this.newListItem(this.pool.get(key)!));
      } else if (deletedIds.has(key)) {
        vm.delete(key);
      }
    }

    for (const newId of newIds) {
      const entity = this.pool.get(newId)!;
      vm.set(newId, this.newListItem(entity));
    }
  }

  private isUnlocked(e: ResourceEntity): boolean {
    return e.amount.unlocked;
  }

  private newListItem(e: ResourceEntity) {
    return <ListItem>{
      id: e.id,
      title: this.metadata[e.id].title,
      unlocked: e.amount.unlocked,
      amount: e.amount.value,
    };
  }
}

export interface ListItem {
  readonly id: ResourceId;
  title: string;
  amount: number;
  capacity?: number;
}

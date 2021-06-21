import { asEnumerable } from "linq-es2015";

import { Ref, ref, unref } from "vue";

import { IRender } from "../ecs";
import {
  ResourceId,
  ResourceEntity,
  ResourceMetadata,
  ResourceMetadataType,
  ResourcePool,
} from ".";

export interface IResourcePresenter extends IRender {
  readonly unlocked: Ref<Map<ResourceId, ListItem>>;
}

export class ResourcePresenter implements IResourcePresenter {
  private readonly metadata: Record<ResourceId, ResourceMetadataType>;

  readonly unlocked: Ref<Map<ResourceId, ListItem>>;

  constructor(private readonly resources: ResourcePool) {
    this.metadata = ResourceMetadata;

    this.unlocked = ref(new Map<ResourceId, ListItem>()) as Ref<
      Map<ResourceId, ListItem>
    >;
  }

  render(): void {
    const vm = unref(this.unlocked);

    const newIds = new Set<ResourceId>();
    const updatedIds = new Set<ResourceId>();
    const deletedIds = new Set<ResourceId>();

    const entities = asEnumerable(
      this.resources.all((e) => e.amount.unlocked),
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
        vm.set(key, this.newListItem(this.resources.get(key)!));
      } else if (deletedIds.has(key)) {
        vm.delete(key);
      }
    }

    for (const newId of newIds) {
      const entity = this.resources.get(newId)!;
      vm.set(newId, this.newListItem(entity));
    }
  }

  private newListItem(e: ResourceEntity): ListItem {
    return {
      id: e.id,
      label: this.metadata[e.id].label,
      amount: e.amount.value,
    };
  }
}

export interface ListItem {
  readonly id: ResourceId;
  label: string;
  amount: number;
}

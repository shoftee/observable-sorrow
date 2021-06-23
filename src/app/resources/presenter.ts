import { asEnumerable } from "linq-es2015";

import { Ref, ref, unref } from "vue";

import { IRender } from "../ecs";
import { ResourceEntity, ResourcePool } from ".";
import { ResourceId, ResourceMetadata } from "../core/metadata/resources";

export interface IResourcePresenter extends IRender {
  readonly items: Ref<ListItem[]>;
}

export class ResourcePresenter implements IResourcePresenter {
  readonly items: Ref<ListItem[]>;

  constructor(private readonly resources: ResourcePool) {
    const entities = this.getListItems();

    this.items = ref(entities) as Ref<ListItem[]>;
  }

  private getListItems(): ListItem[] {
    return asEnumerable(this.resources.all())
      .Select((e) => this.newListItem(e))
      .ToArray();
  }

  render(): void {
    for (const item of unref(this.items)) {
      const entity = this.resources.get(item.id);
      entity.changes.apply((key) => {
        if (key == "unlocked") item.unlocked = entity.state.unlocked;
        if (key == "amount") item.amount = entity.state.amount;
      });
    }
  }

  private newListItem(e: ResourceEntity): ListItem {
    return {
      id: e.id,
      label: ResourceMetadata[e.id].label,
      amount: e.state.amount,
      unlocked: e.state.unlocked,
    };
  }
}

export interface ListItem {
  readonly id: ResourceId;
  label: string;
  amount: number;
  unlocked: boolean;
}

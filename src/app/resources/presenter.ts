import { asEnumerable } from "linq-es2015";

import { Ref, ref, unref } from "vue";

import { IRender } from "../ecs";
import { ResourceEntity } from ".";
import { ResourceId, ResourceMetadata } from "../core/metadata/resources";
import { EntityAdmin } from "../game/entity-admin";

export interface IResourcePresenter extends IRender {
  readonly items: Ref<ListItem[]>;
}

export class ResourcePresenter implements IResourcePresenter {
  readonly items: Ref<ListItem[]>;

  constructor(private admin: EntityAdmin) {
    const entities = this.getListItems();
    this.items = ref(entities) as Ref<ListItem[]>;
  }

  private getListItems(): ListItem[] {
    return asEnumerable(this.admin.resources())
      .Select((e) => this.newListItem(e))
      .ToArray();
  }

  render(): void {
    for (const item of unref(this.items)) {
      const entity = this.admin.resource(item.id);
      entity.notifier.apply((key) => {
        if (key == "unlocked") item.unlocked = entity.state.unlocked;
        if (key == "amount") item.amount = entity.state.amount;
        if (key == "capacity") item.change = entity.state.capacity;
        if (key == "change") item.change = entity.state.change;
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
  change?: number;
  capacity?: number;
  unlocked: boolean;
}

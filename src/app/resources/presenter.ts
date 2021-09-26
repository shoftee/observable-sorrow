import { asEnumerable } from "linq-es2015";

import { Ref, ref, unref } from "vue";

import { IRender } from "../ecs";

import { ResourceId } from "../core/metadata";
import { ResourceMetadata } from "../core/metadata/resources";
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
      .Select(
        (e) =>
          new ListItem(
            e.id,
            ResourceMetadata[e.id].label,
            e.state.unlocked,
            e.state.amount,
            e.state.change,
            e.state.capacity,
          ),
      )
      .ToArray();
  }

  render(): void {
    for (const item of unref(this.items)) {
      const entity = this.admin.resource(item.id);
      entity.changes.apply({
        unlocked: () => {
          item.unlocked = entity.state.unlocked;
        },
        amount: () => {
          item.amount = entity.state.amount;
        },
        capacity: () => {
          item.capacity = entity.state.capacity;
        },
        change: () => {
          item.change = entity.state.change;
        },
      });
    }

    this.admin.effects().changes.apply({
      "catnip-production": () => this.updateCatnipDecorations(),
      "catnip-field-weather": () => this.updateCatnipDecorations(),
    });
  }

  private updateCatnipDecorations() {
    const item = unref(this.items).find((item) => item.id == "catnip");
    if (item) {
      const effects = this.admin.effects();
      if (effects.get("catnip-field-production") == 0) {
        item.modifier = undefined;
      } else {
        item.modifier = effects.get("catnip-field-weather");
      }
    }
  }
}

export class ListItem {
  constructor(
    public readonly id: ResourceId,
    public label: string,
    public unlocked: boolean,
    public amount: number,
    public change?: number,
    public capacity?: number,
    public modifier?: number,
  ) {}
}

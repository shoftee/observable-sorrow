import { asEnumerable } from "linq-es2015";

import { Ref, ref, unref } from "vue";

import { IRender } from "../ecs";
import { ResourceId, ResourceMetadata } from "../core/metadata/resources";
import { EntityAdmin } from "../game/entity-admin";
import { percent } from "../utils/mathx";

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
      entity.notifier.apply((key) => {
        if (key == "unlocked") item.unlocked = entity.state.unlocked;
        if (key == "amount") item.amount = entity.state.amount;
        if (key == "capacity") item.capacity = entity.state.capacity;
        if (key == "change") {
          item.change = entity.state.change;

          if (item.id == "catnip") {
            this.updateCatnipDecorations();
          }
        }
      });
    }

    const environment = this.admin.environment();
    environment.notifier.apply((key) => {
      if (key == "adjustment") {
        this.updateCatnipDecorations();
      }
    });
  }

  private updateCatnipDecorations() {
    const catnip = unref(this.items).find((item) => item.id == "catnip");
    if (catnip) {
      const catnipFieldProduction = this.admin.productionEffect(
        "catnip-field-production",
      );
      if (catnipFieldProduction.effect.amount == 0) {
        catnip.clearDecoration();
      } else {
        catnip.setDecorationAdjustment(
          this.admin.environment().weather.adjustment,
        );
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
    public decorationText?: string,
    public decorationKind?: "bonus" | "malus",
  ) {}

  clearDecoration(): void {
    this.decorationText = undefined;
    this.decorationKind = undefined;
  }

  setDecorationAdjustment(adjustment: number): void {
    if (adjustment == 0) {
      this.clearDecoration();
    } else if (adjustment > 0) {
      this.decorationKind = "bonus";
      this.decorationText = `+${percent(adjustment)}%`;
    } else if (adjustment < 0) {
      this.decorationKind = "malus";
      this.decorationText = `${percent(adjustment)}%`;
    }
  }
}

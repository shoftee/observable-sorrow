import { computed, reactive } from "vue";

import { ResourceId, UnitKind } from "@/app/interfaces";
import { Meta, ResourceMetadataType, ResourceState } from "@/app/state";

import { IStateManager, NumberView } from ".";

export class ResourcesPresenter {
  readonly all: ResourceItem[];

  constructor(manager: IStateManager) {
    this.all = Meta.resources()
      .map((meta) => this.newResource(meta, manager))
      .toArray();
  }

  private newResource(
    meta: ResourceMetadataType,
    manager: IStateManager,
  ): ResourceItem {
    const res = manager.resource(meta.id);

    return reactive({
      id: meta.id,
      label: meta.label,
      unlocked: computed(() => res.unlocked),
      amount: computed(() => res.amount),
      change: computed(() => {
        return meta.id !== "kittens"
          ? this.resourceChange(res)
          : this.kittensChange(manager);
      }),
      capacity: computed(() => res.capacity),
      modifier:
        meta.id !== "catnip"
          ? undefined
          : computed(() => this.catnipModifier(manager)),
    });
  }

  private resourceChange(res: ResourceState): NumberView {
    return {
      value: res.change,
      unit: UnitKind.PerTick,
      showSign: "always",
    };
  }

  private kittensChange(manager: IStateManager): NumberView {
    return {
      value: manager.society().stockpile,
      unit: UnitKind.Percent,
      showSign: "negative",
      rounded: true,
    };
  }

  private catnipModifier(manager: IStateManager): NumberView | undefined {
    const catnipField = manager.building("catnip-field");

    const weatherModifier = manager.numberView("catnip-field.weather");

    if (catnipField.level > 0 && weatherModifier.value !== 0) {
      return weatherModifier;
    } else {
      return undefined;
    }
  }
}

export interface ResourceItem {
  readonly id: ResourceId;
  label: string;
  unlocked: boolean;
  amount: number;
  change: NumberView;
  capacity?: number;
  modifier?: NumberView;
}

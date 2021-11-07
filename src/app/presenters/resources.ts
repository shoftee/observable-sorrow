import { computed, reactive } from "vue";

import { ResourceId } from "@/app/interfaces";
import {
  Meta,
  ResourceMetadataType,
  ResourceState,
  UnitKind,
} from "@/app/state";

import { IStateManager } from ".";
import { numberView, effectTree, NumberView, EffectTree } from "./common";

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
      change: computed(() =>
        meta.id !== "kittens"
          ? this.resourceChange(res)
          : this.kittensChange(manager),
      ),
      capacity: computed(() => res.capacity),
      modifier: computed(() =>
        meta.id === "catnip" ? numberView("weather.ratio", manager) : undefined,
      ),
      deltaTree: computed(() =>
        meta.effects.delta !== undefined
          ? effectTree(meta.effects.delta, manager)
          : undefined,
      ),
    });
  }

  private resourceChange(res: ResourceState): NumberView {
    return {
      value: res.change,
      style: { unit: UnitKind.PerTick },
      showSign: "always",
    };
  }

  private kittensChange(manager: IStateManager): NumberView {
    return {
      value: manager.stockpile("kitten-growth").amount,
      style: { unit: UnitKind.Percent },
      showSign: "negative",
      rounded: true,
    };
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
  deltaTree?: EffectTree;
}

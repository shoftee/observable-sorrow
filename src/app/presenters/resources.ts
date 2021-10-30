import { computed, reactive } from "vue";

import { DeltaEffectId, NumberEffectId, ResourceId } from "@/app/interfaces";
import {
  Meta,
  ResourceMetadataType,
  ResourceState,
  UnitKind,
} from "@/app/state";

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
      modifier: computed(() =>
        meta.id === "catnip" ? manager.numberView("weather.ratio") : undefined,
      ),
      deltaTree: computed(() =>
        this.newEffectTree(meta.effects.delta, manager),
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

  private newEffectTree(
    id: DeltaEffectId | undefined,
    manager: IStateManager,
  ): EffectTree | undefined {
    if (id === undefined) {
      return undefined;
    }
    return reactive({
      nodes: Array.from(this.collectEffectNodes(id, manager)),
    });
  }

  private *collectEffectNodes(
    id: NumberEffectId,
    manager: IStateManager,
  ): Iterable<EffectTreeNode> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    for (const childId of manager.effectTree().get(id)!) {
      const style = Meta.effectDisplay(childId);
      switch (style.disposition) {
        case "hide":
          // completely ignore hidden children
          continue;
        case "inline":
          // treat children-of-child as direct children
          yield* this.collectEffectNodes(childId, manager);
          continue;

        default:
          yield reactive({
            id: childId,
            label: style.label,
            value: computed(() => manager.numberView(childId)),
            // Don't collect children of collapsed nodes
            nodes:
              style.disposition === "collapse"
                ? []
                : Array.from(this.collectEffectNodes(childId, manager)),
          });
      }
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
  deltaTree?: EffectTree;
}

export interface EffectTree {
  nodes: EffectTreeNode[];
}

export interface EffectTreeNode {
  id: NumberEffectId;
  value: NumberView | undefined;
  label?: string;
  nodes: EffectTreeNode[];
}

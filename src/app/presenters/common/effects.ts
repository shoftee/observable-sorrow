import { computed, reactive } from "vue";

import { NumberEffectId } from "@/app/interfaces";
import { Meta } from "@/app/state";

import { IStateManager } from "..";
import { NumberView, numberView } from ".";

export interface EffectItem {
  id: string;
  label: string;
  singleAmount: NumberView | undefined;
  totalAmount: NumberView | undefined;
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

export function effectTree(
  id: NumberEffectId,
  manager: IStateManager,
): EffectTree {
  return reactive({
    nodes: computed(() => Array.from(collectEffectNodes(id, manager))),
  });
}

function* collectEffectNodes(
  id: NumberEffectId,
  manager: IStateManager,
): Iterable<EffectTreeNode> {
  const children = manager.effectTree().get(id) ?? [];
  for (const child of children) {
    const style = Meta.effectDisplay(child);
    switch (style.disposition) {
      case "hide":
        // completely ignore hidden children
        continue;
      case "inline":
        // treat children-of-child as direct children
        yield* collectEffectNodes(child, manager);
        continue;

      default:
        yield reactive({
          id: child,
          label: style.label,
          value: computed(() => numberView(manager, child)),
          // Don't collect children of collapsed nodes
          nodes:
            style.disposition === "collapse"
              ? []
              : Array.from(collectEffectNodes(child, manager)),
        });
    }
  }
}

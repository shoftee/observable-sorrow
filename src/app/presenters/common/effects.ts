import { computed, reactive } from "vue";

import { NumberEffectId } from "@/app/interfaces";
import { Meta } from "@/app/state";
import { StateSchema } from "@/app/game/systems2/core";

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

export function effectTree(id: NumberEffectId, state: StateSchema): EffectTree {
  return reactive({
    nodes: computed(() => Array.from(collectEffectNodes(id, state))),
  });
}

function* collectEffectNodes(
  id: NumberEffectId,
  state: StateSchema,
): Iterable<EffectTreeNode> {
  const children = state.numbers[id]?.references;
  for (const child of children ?? []) {
    const style = Meta.effectDisplay(child);
    switch (style.disposition) {
      case "hide":
        // completely ignore hidden children
        continue;
      case "inline":
        // treat children-of-child as direct children
        yield* collectEffectNodes(child, state);
        continue;

      default:
        yield reactive({
          id: child,
          label: style.label,
          value: computed(() => numberView(state, child)),
          // Don't collect children of collapsed nodes
          nodes:
            style.disposition === "collapse"
              ? []
              : Array.from(collectEffectNodes(child, state)),
        });
    }
  }
}

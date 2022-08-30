import { all } from "@/app/utils/collections";

import { EcsPlugin, PluginApp } from "@/app/ecs";
import {
  AddedOrChanged,
  Any,
  ChildrenQuery,
  DiffMut,
  MapQuery,
  Query,
  Value,
} from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { BooleanEffect, BooleanValue } from "../effects/types";
import { Section } from "../section/types";
import { Building } from "../types/common";

import { Unlocked, UnlockOnEffect } from "./types";

const MarkUnlockedFromEffects = System(
  MapQuery(Value(BooleanEffect), Value(BooleanValue)).filter(
    AddedOrChanged(BooleanValue),
  ),
  MapQuery(Value(UnlockOnEffect), DiffMut(Unlocked)),
)((effects, unlockedLookup) => {
  for (const [id, effectValue] of effects) {
    const unlocked = unlockedLookup.get(id);
    if (unlocked) {
      unlocked.value = effectValue ?? false;
    }
  }
});

const MarkAggregateUnlocks = System(
  Query(DiffMut(Unlocked), ChildrenQuery(Value(Unlocked))).filter(
    Any(Building, Section),
  ),
)((query) => {
  for (const [unlocked, parts] of query) {
    if (!unlocked.value) {
      unlocked.value = all(parts, ([value]) => value);
    }
  }
});

export class UnlockResolutionPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app.addSystems([MarkUnlockedFromEffects, MarkAggregateUnlocks]);
  }
}

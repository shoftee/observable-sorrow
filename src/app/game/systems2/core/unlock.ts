import { ChildrenQuery, DiffMut, Every, Query, Value } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";
import { all } from "@/app/utils/collections";

import { Unlocked, Building } from "../types/common";

export const AggregateBuildingUnlocks = System(
  Query(DiffMut(Unlocked), ChildrenQuery(Value(Unlocked))).filter(
    Every(Building),
  ),
)((query) => {
  for (const [unlocked, parts] of query.all()) {
    if (!unlocked.value) {
      unlocked.value = all(parts, ([value]) => value);
    }
  }
});

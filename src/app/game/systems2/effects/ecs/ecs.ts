import { ChangeTrackers, EntityLookup, MapQuery, Value } from "@/app/ecs/query";

import { NumberEffect, NumberValue } from "../types";

export const NumberTrackersQuery = MapQuery(
  Value(NumberEffect),
  ChangeTrackers(NumberValue),
);

export const NumberEffectEntities = EntityLookup(Value(NumberEffect));

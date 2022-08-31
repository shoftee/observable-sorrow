import { StateSchema } from "@/app/game/systems2/core";

import { computed, ComputedRef, Ref, unref } from "vue";

export function fromIds<Id, View>(
  schema: StateSchema,
  ids: Ref<Iterable<Id>> | Iterable<Id>,
  fn: (s: StateSchema, id: Id) => View,
): ComputedRef<View[]> {
  return computed(() => Array.from(unref(ids), (id) => fn(schema, id)));
}

export function filterArrayView<T>(
  array: Ref<T[]>,
  predicate: (item: T, index: number, array: T[]) => unknown,
): Ref<T[]> {
  return computed(() => unref(array).filter(predicate));
}

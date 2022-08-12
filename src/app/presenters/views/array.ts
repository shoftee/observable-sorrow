import { computed, ComputedRef } from "vue";

import { IStateManager } from "..";

export function fromIds<Id, View>(
  manager: IStateManager,
  ids: Iterable<Id>,
  fn: (id: Id, mgr: IStateManager) => View,
): ComputedRef<View[]> {
  return computed(() => Array.from(ids, (id) => fn(id, manager)));
}

export function filterArrayView<T>(
  array: ComputedRef<T[]>,
  predicate: (item: T, index: number, array: T[]) => unknown,
): ComputedRef<T[]> {
  return computed(() => array.value.filter(predicate));
}

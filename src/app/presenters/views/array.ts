import { computed, ComputedRef, Ref, unref } from "vue";

import { IStateManager } from "..";

export function fromIds<Id, View>(
  manager: IStateManager,
  ids: Ref<Iterable<Id>> | Iterable<Id>,
  fn: (mgr: IStateManager, id: Id) => View,
): ComputedRef<View[]> {
  return computed(() => Array.from(unref(ids), (id) => fn(manager, id)));
}

export function filterArrayView<T>(
  array: Ref<T[]>,
  predicate: (item: T, index: number, array: T[]) => unknown,
): Ref<T[]> {
  return computed(() => unref(array).filter(predicate));
}

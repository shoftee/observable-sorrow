import { computed, ComputedRef, Ref, unref } from "vue";

export function valuesRef<TKey, TValue>(
  map: Ref<Map<TKey, TValue>>,
): ComputedRef<Iterable<TValue>> {
  return computed(() => unref(map).values());
}

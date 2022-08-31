import { EntityQueryFactory } from "../types";

/**
 * Eagerly turn iterables into arrays before they are included into a query's results.
 */
export function Eager<T>(
  query: EntityQueryFactory<Iterable<T>>,
): EntityQueryFactory<T[]> {
  return {
    newQuery(world) {
      const inner = query.newQuery(world);
      return {
        ...inner,
        fetch(ctx) {
          return Array.from(inner.fetch(ctx));
        },
      };
    },
  };
}

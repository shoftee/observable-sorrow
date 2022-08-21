import { defaultQuery, QueryDescriptor } from "../types";

type Opt<F> = QueryDescriptor<F | undefined>;
/**
 * Include potentially missing components in the query results.
 *
 * When calling All(), results are included only when all queried components are present.
 * Use Opt to loosen this requirement.
 */
export function Opt<F>(query: QueryDescriptor<F>): Opt<F> {
  return {
    newQuery(world) {
      const inner = query.newQuery(world);
      return defaultQuery({
        fetch(ctx) {
          return inner.includes(ctx) ? inner.fetch(ctx) : undefined;
        },
        cleanup() {
          inner.cleanup();
        },
      });
    },
  };
}

import { inspectable } from "@/app/ecs";

import { QueryDescriptor } from "../types";

type Opt<F> = QueryDescriptor<F | undefined>;

/**
 * Include potentially missing components in the query results.
 *
 * When calling All(), results are included only when all queried components are present.
 * Use Opt to loosen this requirement.
 */
export function Opt<F>(inner: QueryDescriptor<F>): Opt<F> {
  return {
    inspect() {
      return inspectable(Opt, [inner]);
    },
    *dependencies() {
      yield inner;
    },
    newQuery(world) {
      const q = inner.newQuery(world);
      return {
        fetch(ctx) {
          return inner.includes?.(ctx.archetype) ?? true
            ? q.fetch(ctx)
            : undefined;
        },
        cleanup() {
          q.cleanup?.();
        },
      };
    },
  };
}

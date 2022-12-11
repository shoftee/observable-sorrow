import { memoizer } from "@/app/utils/collections/memo";
import { Constructor as Ctor } from "@/app/utils/types";

import { inspectable, inspectableNames, MarkerComponent } from "@/app/ecs";

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type IsMarked<M extends MarkerComponent> = QueryDescriptor<boolean>;
const IsMarkedMemo = memoizer<
  Ctor<MarkerComponent>,
  IsMarked<MarkerComponent>
>();
export function IsMarked<M extends MarkerComponent>(
  ctor: Ctor<M>,
): IsMarked<M> {
  return IsMarkedMemo.get(ctor, newIsMarked);
}
function newIsMarked<M extends MarkerComponent>(ctor: Ctor<M>): IsMarked<M> {
  return {
    inspect() {
      return inspectable(IsMarked, inspectableNames([ctor]));
    },
    newQuery() {
      return {
        fetch({ archetype }) {
          return archetype.has(ctor);
        },
      };
    },
  };
}

import { EcsEntity, Archetype, WorldState, EcsComponent } from "@/app/ecs";
import { QueryDescriptor } from "../types";

type Opt<F> = QueryDescriptor<F | undefined>;

/**
 * Include potentially missing components in the query results.
 *
 * When calling All(), results are included only when all queried components are present.
 * Use Opt to loosen this requirement.
 */
export function Opt<F>(query: QueryDescriptor<F>): Opt<F> {
  return {
    newQuery(state: WorldState) {
      const inner = query.newQuery(state);
      return {
        fetch: (entity: EcsEntity, archetype: Archetype<EcsComponent>) => {
          if (inner.includes?.(archetype) ?? true) {
            return inner.fetch(entity, archetype);
          } else {
            return undefined;
          }
        },
      };
    },
  };
}

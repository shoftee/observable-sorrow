import { EcsEntity, Archetype, WorldState, EcsComponent } from "../world";
import { QueryDescriptor } from "./types";

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
        match: () => {
          return true;
        },
        fetch: (entity: EcsEntity, archetype: Archetype<EcsComponent>) => {
          if (inner.match(archetype)) {
            return inner.fetch(entity, archetype);
          } else {
            return undefined;
          }
        },
      };
    },
  };
}

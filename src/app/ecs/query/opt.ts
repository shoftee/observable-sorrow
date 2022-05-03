import { Entity, Archetype } from "../world";
import { WorldQuery } from "./types";

class OptQuery<F> implements WorldQuery<F | undefined> {
  constructor(private readonly inner: WorldQuery<F>) {}

  match(): boolean {
    return true;
  }

  fetch(entity: Entity, archetype: Archetype): F | undefined {
    // inner fetch being undefined is not reflected in the types, but it's possible.
    return this.inner.fetch(entity, archetype);
  }
}

/**
 * Include potentially missing components in the query results.
 *
 * When calling All(), results are included only when all queried components are present.
 * Use Opt to loosen this requirement.
 */
export function Opt<F>(query: WorldQuery<F>): OptQuery<F> {
  return new OptQuery<F>(query);
}

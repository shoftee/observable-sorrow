import { Entity, Archetype } from "./world";

export interface ArchetypeContainer {
  archetype(entity: Entity): Archetype;
  archetypes(): Iterable<[Entity, Archetype]>;
}

export type FetchContext = {
  readonly archetypes: ArchetypeContainer;
  readonly entity: Entity;
};

export interface Fetch<T> {
  fetch(ctx: FetchContext): T;
}

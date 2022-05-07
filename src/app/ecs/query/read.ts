import { Constructor as Ctor } from "@/app/utils/types";

import { Archetype, EcsComponent, EcsEntity } from "../world";
import { WorldQuery } from "./types";

class ReadQuery<C extends EcsComponent> implements WorldQuery<Readonly<C>> {
  constructor(readonly ctor: Ctor<C>) {}

  match(archetype: Archetype): boolean {
    return archetype.has(this.ctor);
  }

  fetch(_: EcsEntity, archetype: Archetype<C>): Readonly<C> {
    return archetype.get(this.ctor)!;
  }
}

/** Include a read-only view of a component in the query results. */
export function Read<C extends EcsComponent>(ctor: Ctor<C>): ReadQuery<C> {
  return new ReadQuery<C>(ctor);
}

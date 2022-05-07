import { Constructor as Ctor } from "@/app/utils/types";

import { Archetype, EcsComponent, EcsEntity } from "../world";
import { WorldQuery } from "./types";

class MutQuery<C extends EcsComponent> implements WorldQuery<C> {
  constructor(readonly ctor: Ctor<C>) {}

  match(archetype: Archetype): boolean {
    return archetype.has(this.ctor);
  }

  fetch(_: EcsEntity, archetype: Archetype<C>): C {
    return archetype.get(this.ctor)!;
  }
}

/** Include a mutable view of a component in the query results. */
export function Mut<C extends EcsComponent>(ctor: Ctor<C>): MutQuery<C> {
  return new MutQuery<C>(ctor);
}

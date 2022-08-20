import { TypeSet } from "@/app/utils/collections";
import { Constructor as Ctor } from "@/app/utils/types";

import { EcsResource } from "../types";

export class ResourceState {
  private readonly entries = new TypeSet<EcsResource>();

  register<R extends EcsResource>(resource: R): void {
    this.entries.add(resource);
  }

  get<R extends EcsResource>(ctor: Ctor<R>): R | undefined {
    return this.entries.get(ctor);
  }

  has<R extends EcsResource>(ctor: Ctor<R>): boolean {
    return this.entries.has(ctor);
  }
}

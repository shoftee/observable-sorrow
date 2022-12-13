import { all } from "@/app/utils/collections";
import { Archetype, EcsComponent, EcsMetadata, inspectable } from "../../types";
import { World } from "../../world";
import {
  Descriptor,
  FilterDescriptor,
  OneOrMoreFilters,
  QueryDescriptor,
  WorldQuery,
} from "../types";

type KeyedQuery = { [K in PropertyKey]: QueryDescriptor };
type UnwrapKeyedWorldQuery<Q extends KeyedQuery> = {
  [K in keyof Q]: Q[K] extends WorldQuery<infer Result>
    ? WorldQuery<Result>
    : never;
};
type UnwrapKeyedResults<Q extends KeyedQuery> = {
  [K in keyof Q]: Q[K] extends QueryDescriptor<infer Result> ? Result : never;
};

class KeyedQueryDescriptor<Q extends KeyedQuery>
  implements QueryDescriptor<UnwrapKeyedResults<Q>>
{
  private readonly descriptors: QueryDescriptor[];
  constructor(readonly descriptorObj: Q, readonly filters: FilterDescriptor[]) {
    this.descriptors = Object.values(this.descriptorObj);
  }

  filter(...filters: OneOrMoreFilters): KeyedQueryDescriptor<Q> {
    return new KeyedQueryDescriptor(this.descriptorObj, [
      ...this.filters,
      ...filters,
    ]);
  }

  inspect(): EcsMetadata {
    return inspectable(Keyed, this.dependencies());
  }

  *dependencies(): Iterable<Descriptor> {
    yield* this.filters;
    yield* this.descriptors;
  }

  includes(archetype: Archetype<EcsComponent>): boolean {
    return all(this.dependencies(), (f) => f.includes?.(archetype) ?? true);
  }

  newQuery(world: World): WorldQuery<UnwrapKeyedResults<Q>> {
    const filters = this.filters.map((f) => f.newFilter(world));
    const worldQueryObj = this.buildWorldQueryObj(world);
    const instances = function* () {
      yield* filters;
      yield* Object.values(worldQueryObj);
    };

    return {
      matches(ctx) {
        return all(instances(), (f) => f.matches?.(ctx) ?? true);
      },
      cleanup() {
        for (const { cleanup } of instances()) {
          cleanup?.();
        }
      },
      fetch(ctx) {
        const result = {};
        for (const [key, value] of Object.entries(worldQueryObj)) {
          Reflect.set(result, key, value.fetch(ctx));
        }
        return result as UnwrapKeyedResults<Q>;
      },
    };
  }

  private buildWorldQueryObj(world: World): UnwrapKeyedWorldQuery<Q> {
    const result = {};
    for (const [key, value] of Object.entries(this.descriptorObj)) {
      Reflect.set(result, key, value.newQuery(world));
    }
    return result as UnwrapKeyedWorldQuery<Q>;
  }
}

export function Keyed<Q extends KeyedQuery>(
  q: Q,
): QueryDescriptor<UnwrapKeyedResults<Q>> {
  return new KeyedQueryDescriptor(q, []);
}

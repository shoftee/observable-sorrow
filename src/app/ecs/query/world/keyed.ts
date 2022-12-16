import { all } from "@/app/utils/collections";
import { Archetype, EcsComponent, EcsMetadata, inspectable } from "../../types";
import { World } from "../../world";
import {
  Descriptor,
  FilterDescriptor,
  InferQueryResult,
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
  [K in keyof Q]: InferQueryResult<Q[K]>;
};

class KeyedQueryDescriptor<Q extends KeyedQuery>
  implements QueryDescriptor<UnwrapKeyedResults<Q>>
{
  private readonly descriptors: QueryDescriptor[];
  constructor(readonly descriptorObj: Q, readonly filters: FilterDescriptor[]) {
    this.descriptors = Object.values(this.descriptorObj);
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
        for (const instance of instances()) {
          instance.cleanup?.();
        }
      },
      fetch(ctx) {
        return new Proxy(worldQueryObj, {
          get(target, p, receiver) {
            return Reflect.get(target, p, receiver).fetch(ctx);
          },
        }) as UnwrapKeyedResults<Q>;
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

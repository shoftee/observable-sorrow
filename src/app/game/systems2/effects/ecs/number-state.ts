import { NumberEffectId } from "@/app/interfaces";

import { inspectable } from "@/app/ecs";
import { SystemParamDescriptor } from "@/app/ecs/query/types";
import { MapQuery, Value } from "@/app/ecs/query";

import { NumberEffect, NumberValue } from "../types";

const NumberValues = MapQuery(Value(NumberEffect), Value(NumberValue));

type Lookup = { readonly [K in NumberEffectId]: number | undefined };
type NumberState = SystemParamDescriptor<Lookup>;
export function NumberState(): NumberState {
  return {
    inspect() {
      return inspectable(NumberState, [NumberValues]);
    },
    create(world) {
      const query = NumberValues.create(world);
      return {
        fetch() {
          const values = query.fetch();
          return new Proxy(
            {},
            {
              get(_, key) {
                return values.get(key as NumberEffectId);
              },
            },
          ) as Lookup;
        },
        cleanup() {
          query.cleanup?.();
        },
      };
    },
  };
}

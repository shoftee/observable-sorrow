import { Queue } from "queue-typescript";

import { consume, map, MultiMap } from "@/app/utils/collections";

import { NumberEffectId } from "@/app/interfaces";

import { EcsEntity, inspectable } from "@/app/ecs";
import { QueryDescriptor, SystemParamDescriptor } from "@/app/ecs/query/types";
import {
  ChangeTrackers,
  Entity,
  EntityLookup,
  EntityMapQuery,
  MapQuery,
  Parents,
  Query,
  Value,
} from "@/app/ecs/query";

import { NumberEffect, NumberValue, Reference } from "./types";

export const NumberTrackersQuery = MapQuery(
  Value(NumberEffect),
  ChangeTrackers(NumberValue),
);

export const NumberEffectEntities = EntityLookup(Value(NumberEffect));
const NumberValues = MapQuery(Value(NumberEffect), Value(NumberValue));

const ParentsQuery = EntityMapQuery(Parents());
const RefsQuery = Query(Value(Reference), Entity());

type NumberState = { [K in NumberEffectId]: number | undefined };
export function NumberState(): SystemParamDescriptor<NumberState> {
  return {
    inspect() {
      return inspectable(NumberState);
    },
    create(world) {
      const valuesQuery = NumberValues.create(world);
      return {
        fetch() {
          const values = valuesQuery.fetch();
          return new Proxy(
            {},
            {
              get(_, key) {
                return values.get(key as NumberEffectId);
              },
            },
          ) as NumberState;
        },
        cleanup() {
          valuesQuery.cleanup?.();
        },
      };
    },
  };
}

type EffectEntities = {
  [Symbol.iterator](): IterableIterator<EcsEntity>;
};

export function DependentEffectsQuery(
  selector: QueryDescriptor<NumberEffectId>,
): SystemParamDescriptor<EffectEntities> {
  return {
    inspect() {
      return inspectable(DependentEffectsQuery, [selector]);
    },
    create(world) {
      world.queries.register(selector);
      const idsFetcher = world.queries.get(selector);

      const idsLookupQuery = NumberEffectEntities.create(world);
      const parentsQuery = ParentsQuery.create(world);
      const refsQuery = RefsQuery.create(world);

      const fetcher = {
        *[Symbol.iterator]() {
          const initial = map(idsFetcher.values(), (id) => idsLookup.get(id)!);

          const idsLookup = idsLookupQuery.fetch();
          const refsLookup = refsQuery.fetch();
          const referrersLookup = new MultiMap<EcsEntity, EcsEntity>();
          for (const [ref, referrer] of refsLookup) {
            const referenced = idsLookup.get(ref)!;
            referrersLookup.add(referenced, referrer);
          }

          const parentsLookup = parentsQuery.fetch();

          yield* findDependentEffects(
            initial,
            (e) => parentsLookup.get(e)![0],
            (e) => referrersLookup.entriesForKey(e),
          );
        },
      };

      return {
        fetch() {
          return fetcher;
        },
        cleanup() {
          idsFetcher.cleanup();

          idsLookupQuery.cleanup?.();
          parentsQuery.cleanup?.();
          refsQuery.cleanup?.();
        },
      };
    },
  };
}

function* findDependentEffects(
  base: Iterable<EcsEntity>,
  parentsOf: (entity: EcsEntity) => Iterable<EcsEntity>,
  referrersOf: (entity: EcsEntity) => Iterable<EcsEntity>,
): Iterable<EcsEntity> {
  const found = new Set<EcsEntity>();

  const queue = new Queue<EcsEntity>();
  for (const effect of base) {
    queue.enqueue(effect);
  }

  for (const effect of consume(queue)) {
    for (const parent of parentsOf(effect)) {
      if (!found.has(parent)) {
        queue.enqueue(parent);
      }
    }
    for (const referrer of referrersOf(effect)) {
      if (!found.has(referrer)) {
        queue.enqueue(referrer);
      }
    }
    found.add(effect);
  }

  yield* found;
}

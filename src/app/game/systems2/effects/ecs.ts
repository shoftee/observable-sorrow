import { Queue } from "queue-typescript";

import { consume, map, MultiMap } from "@/app/utils/collections";
import { cache } from "@/app/utils/cache";

import { NumberEffectId } from "@/app/interfaces";

import { EcsEntity } from "@/app/ecs";
import { EntityQueryFactory, WorldQueryFactory } from "@/app/ecs/query/types";
import {
  ChangeTrackers,
  Entity,
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

export const EntityByIdQuery = MapQuery(Value(NumberEffect), Entity());
const ParentsQuery = MapQuery(Entity(), Parents());
const RefsQuery = Query(Value(Reference), Entity());

type EffectEntityFetcher = {
  [Symbol.iterator](): IterableIterator<EcsEntity>;
};

export function DependentEffectsQuery(
  idsQuery: EntityQueryFactory<NumberEffectId>,
): WorldQueryFactory<EffectEntityFetcher> {
  return {
    create(world) {
      world.queries.register(idsQuery);
      const idsFetcher = world.queries.get(idsQuery);

      const idsLookupQuery = EntityByIdQuery.create(world);
      const idsLookupCache = cache(() => idsLookupQuery.fetch());

      const parentsQuery = ParentsQuery.create(world);
      const parentsCache = cache(() => parentsQuery.fetch());

      const refsQuery = RefsQuery.create(world);
      const refsCache = cache(() => refsQuery.fetch());

      const fetcher = {
        *[Symbol.iterator]() {
          const initial = map(idsFetcher.values(), (id) => idsLookup.get(id)!);

          const idsLookup = idsLookupCache.retrieve();
          const refsLookup = refsCache.retrieve();
          const referrersLookup = new MultiMap<EcsEntity, EcsEntity>();
          for (const [ref, referrer] of refsLookup) {
            const referenced = idsLookup.get(ref)!;
            referrersLookup.add(referenced, referrer);
          }

          const parentsLookup = parentsCache.retrieve();

          yield* findDependentEffects(
            initial,
            (e) => parentsLookup.get(e)!,
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

          idsLookupCache.invalidate();
          idsLookupQuery.cleanup?.();

          parentsCache.invalidate();
          parentsQuery.cleanup?.();

          refsCache.invalidate();
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

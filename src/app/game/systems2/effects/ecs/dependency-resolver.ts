import { Queue } from "queue-typescript";

import {
  MultiMap,
  map,
  consume,
  enqueueAll,
  concat,
  filter,
} from "@/app/utils/collections";
import { NumberEffectId } from "@/app/interfaces";

import { EcsEntity, inspectable } from "@/app/ecs";
import {
  MapQuery,
  Entity,
  Parents,
  Value,
  MapQueryResult,
  IterableQueryResult,
  EntityLookup,
} from "@/app/ecs/query";
import { SystemParamDescriptor } from "@/app/ecs/query/types";

import { Reference } from "../types";
import { NumberEffectEntities } from "./ecs";

// EcsEntity => Iterable of parent EcsEntity's
// Not using EntityMapQuery because we only have one value and we don't want to deal with tuples.
const ParentsQuery = MapQuery(Entity(), Parents());

// NumberEffectId reference value => EcsEntity
const RefsQuery = EntityLookup(Value(Reference));

type EffectDependencyResolver = {
  findByIds(ids: Iterable<NumberEffectId>): Iterable<EcsEntity>;
  findByEntities(entities: Iterable<EcsEntity>): Iterable<EcsEntity>;
};

export function EffectDependencyResolver(): SystemParamDescriptor<EffectDependencyResolver> {
  return {
    inspect() {
      return inspectable(EffectDependencyResolver, [
        NumberEffectEntities,
        ParentsQuery,
        RefsQuery,
      ]);
    },
    create(world) {
      const idsLookupQuery = NumberEffectEntities.create(world);
      const parentsQuery = ParentsQuery.create(world);
      const refsQuery = RefsQuery.create(world);

      return {
        fetch() {
          return new EffectDependencyResolverImpl(
            idsLookupQuery.fetch(),
            parentsQuery.fetch(),
            refsQuery.fetch(),
          );
        },
        cleanup() {
          idsLookupQuery.cleanup?.();
          parentsQuery.cleanup?.();
          refsQuery.cleanup?.();
        },
      };
    },
  };
}

class EffectDependencyResolverImpl implements EffectDependencyResolver {
  private readonly referrersLookup = new MultiMap<EcsEntity, EcsEntity>();

  constructor(
    private readonly idsLookup: MapQueryResult<
      NumberEffectId,
      Readonly<EcsEntity>
    >,
    private readonly parentsLookup: MapQueryResult<
      EcsEntity,
      Iterable<EcsEntity>
    >,
    refsLookup: IterableQueryResult<
      [Readonly<NumberEffectId>, Readonly<EcsEntity>]
    >,
  ) {
    for (const [ref, referrer] of refsLookup) {
      const referenced = idsLookup.get(ref)!;
      this.referrersLookup.add(referenced, referrer);
    }
  }

  findByIds(ids: Iterable<NumberEffectId>): Iterable<EcsEntity> {
    const entities = map(ids, (id) => this.idsLookup.get(id)!);
    return this.findByEntities(entities);
  }

  findByEntities(entities: Iterable<EcsEntity>): Iterable<EcsEntity> {
    return this.resolve(entities);
  }

  private *resolve(base: Iterable<EcsEntity>): Iterable<EcsEntity> {
    const queue = new Queue<EcsEntity>(...base);

    const found = new Set<EcsEntity>();

    for (const effect of consume(queue)) {
      enqueueAll(
        queue,
        filter(
          concat(
            this.parentsLookup.get(effect)!,
            this.referrersLookup.entriesForKey(effect),
          ),
          (e) => !found.has(e),
        ),
      );

      found.add(effect);
    }

    // reverse results so that the top-level effects appear first.
    yield* Array.from(found).reverse();
  }
}

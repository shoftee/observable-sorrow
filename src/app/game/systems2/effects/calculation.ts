import { Queue } from "queue-typescript";

import { cache } from "@/app/utils/cache";
import { consume, map, MultiMap } from "@/app/utils/collections";

import { NumberEffectId } from "@/app/interfaces";

import { EcsEntity } from "@/app/ecs";
import {
  ChangeTrackers,
  ChildrenQuery,
  DiffMut,
  Eager,
  Entity,
  EntityMapQuery,
  MapQuery,
  Opt,
  Parents,
  Query,
  Read,
  Value,
} from "@/app/ecs/query";
import { FetcherFactory, QueryDescriptor } from "@/app/ecs/query/types";
import { System } from "@/app/ecs/system";

import {
  Default,
  NumberValue,
  NumberEffect,
  Operation,
  OperationType,
  Reference,
  Operand,
  Constant,
  Precalculated,
} from "./types";

export const NumberTrackersQuery = MapQuery(
  Value(NumberEffect),
  ChangeTrackers(NumberValue),
);

type EffectTuple = [
  NumberValue,
  Readonly<Reference> | undefined,
  Readonly<Default> | undefined,
  Readonly<Constant> | undefined,
  Readonly<Precalculated> | undefined,
];

const ParentsQuery = MapQuery(Entity(), Parents());
const EntityByIdQuery = MapQuery(Value(NumberEffect), Entity());
const ReferencesQuery = Query(Value(Reference), Entity());
const EffectsTupleQuery = EntityMapQuery(
  DiffMut(NumberValue),
  Opt(Read(Reference)),
  Opt(Read(Default)),
  Opt(Read(Constant)),
  Opt(Read(Precalculated)),
);
const OperationsTupleQuery = EntityMapQuery(
  Read(Operation),
  Eager(ChildrenQuery(Entity(), Read(Operand), Read(NumberValue))),
);

type OperandTuple = [
  Readonly<EcsEntity>,
  Readonly<Operand>,
  Readonly<NumberValue>,
];

type OperationTuple = [Readonly<Operation>, OperandTuple[]];

type UpdateContext = {
  effect(entity: EcsEntity): EffectTuple | undefined;
  operation(entity: EcsEntity): OperationTuple | undefined;
  entity(id: NumberEffectId): EcsEntity | undefined;
  gathered: Set<EcsEntity>;
};

export const RecalculateByList = function (...ids: NumberEffectId[]) {
  return System(
    EntityByIdQuery,
    EffectsTupleQuery,
    OperationsTupleQuery,
  )((idsLookup, effectsQuery, operationsQuery) => {
    const entities = Array.from(ids, (id) => idsLookup.get(id)!);

    const ctx: UpdateContext = {
      effect: (entity) => effectsQuery.get(entity),
      operation: (entity) => operationsQuery.get(entity),
      entity: (id) => idsLookup.get(id),
      gathered: new Set(),
    };

    for (const entity of entities) {
      gather(ctx, entity);
    }
  });
};

export const RecalculateByQuery = function (
  selectionQuery: QueryDescriptor<NumberEffectId>,
) {
  return System(
    EffectsQuery(selectionQuery),
    EntityByIdQuery,
    EffectsTupleQuery,
    OperationsTupleQuery,
  )((selected, idsLookup, effectsQuery, operationsQuery) => {
    const entities = selected.entities();

    const ctx: UpdateContext = {
      effect: (entity) => effectsQuery.get(entity),
      operation: (entity) => operationsQuery.get(entity),
      entity: (id) => idsLookup.get(id),
      gathered: new Set(),
    };

    for (const entity of entities) {
      gather(ctx, entity);
    }
  });
};

function gather(ctx: UpdateContext, current: EcsEntity): number | undefined {
  const [val, ref, def, constant, precalculated] = ctx.effect(current)!;
  if (!ctx.gathered.has(current)) {
    if (precalculated) {
      // effect already has a value to use
      // assume gathered and proceed
      ctx.gathered.add(current);
    } else {
      let gatheredValue: number | undefined;
      if (constant) {
        // effect value should be constant
        // assign to make sure actual value matches the constant
        gatheredValue = constant.value;
      } else {
        // effect requires calculation
        if (ref) {
          gatheredValue = gather(ctx, ctx.entity(ref.value)!);
        } else {
          const operationTuple = ctx.operation(current);
          if (operationTuple) {
            const [operation, operands] = operationTuple;
            gatheredValue = Calculators[operation.type](
              gatherValues(ctx, operands),
            );
          }
        }
        if (gatheredValue === undefined && def) {
          // effect calculation yielded no result, use default value
          gatheredValue = def.value;
        }
      }

      ctx.gathered.add(current);
      val.value = gatheredValue;
      return gatheredValue;
    }
  }

  return val.value;
}

function* gatherValues(
  ctx: UpdateContext,
  operands: Iterable<OperandTuple>,
): IterableIterator<OperandTuple> {
  for (const operand of operands) {
    gather(ctx, operand[0]);
    yield operand;
  }
}

type CalculatorFn = (tuples: Iterable<OperandTuple>) => number | undefined;

const Calculators: Record<OperationType, CalculatorFn> = {
  sum: (tuples) => {
    let sum = 0;
    for (const [, , { value }] of tuples) {
      if (value === undefined) return undefined;
      sum += value;
    }
    return sum;
  },
  product: (tuples) => {
    let prod = 1;
    for (const [, , { value }] of tuples) {
      if (value === undefined) return undefined;
      prod *= value;
    }
    return prod;
  },
  ratio: (tuples) => {
    const arrays = Array.from(tuples).sort(
      // always sort 'base' value first
      // these should always be two, so this rule should be enough.
      ([, operand], _) => (operand!.type === "base" ? -1 : 1),
    );

    // Extract base and ratio values from tuples.
    const [[, , { value: base }], [, , { value: ratio }]] = arrays;

    return base === undefined || ratio === undefined
      ? undefined
      : base * (1 + ratio);
  },
};

type EffectsQueryFetcher = {
  entities(): IterableIterator<EcsEntity>;
};

function EffectsQuery(
  idsQuery: QueryDescriptor<NumberEffectId>,
): FetcherFactory<EffectsQueryFetcher> {
  return {
    create(world) {
      world.queries.register(idsQuery);

      const idsFetcher = world.queries.get(idsQuery);

      const idsCache = cache(() => EntityByIdQuery.create(world).fetch());
      const parentsCache = cache(() => ParentsQuery.create(world).fetch());
      const referencesCache = cache(() =>
        ReferencesQuery.create(world).fetch(),
      );

      const fetcher = {
        *entities() {
          const filter = idsFetcher.resultValues();
          const initial = map(filter, (id) => idsLookup.get(id)!);

          const idsLookup = idsCache.retrieve();
          const referencesLookup = referencesCache.retrieve();
          const referrersLookup = new MultiMap<EcsEntity, EcsEntity>();
          for (const [reference, referrer] of referencesLookup) {
            const referenced = idsLookup.get(reference)!;
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

          idsCache.invalidate();
          parentsCache.invalidate();
          referencesCache.invalidate();
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

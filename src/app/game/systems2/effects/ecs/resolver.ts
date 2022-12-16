import {
  concat,
  consume,
  map,
  MultiMap,
  untuple,
} from "@/app/utils/collections";

import { NumberEffectId } from "@/app/interfaces";

import { EcsEntity, inspectable } from "@/app/ecs";
import {
  EntityMapQuery,
  DiffMut,
  Opt,
  Read,
  IsMarked,
  ChildrenQuery,
  Entity,
  MapQueryResult,
  Keyed,
  Value,
  Transform,
  Fresh,
  EntityLookup,
  IterableQueryResult,
  MapQuery,
  Parents,
} from "@/app/ecs/query";
import { SystemParamDescriptor } from "@/app/ecs/query/types";

import * as E from "../types";

import { Queue } from "queue-typescript";

type EffectType = {
  id?: NumberEffectId;
  value: E.NumberValue;
  reference?: NumberEffectId;
  default?: number;
  constant?: number;
  precalculated: boolean;
};

export const NumberEffectEntities = EntityLookup(Value(E.NumberEffect));

export const FreshnessLookup = EntityLookup(Value(E.NumberEffect)).filter(
  Fresh(E.NumberValue),
);

// EcsEntity => Iterable of parent EcsEntity's
// Not using EntityMapQuery because we only have one value and we don't want to deal with tuples.
const ParentsQuery = MapQuery(Entity(), Parents());

// NumberEffectId reference value => EcsEntity
const RefsQuery = EntityLookup(Value(E.Reference));

const EffectsQuery = EntityMapQuery(
  Keyed({
    id: Opt(Value(E.NumberEffect)),
    value: DiffMut(E.NumberValue),
    reference: Opt(Value(E.Reference)),
    default: Opt(Value(E.Default)),
    constant: Opt(Value(E.Constant)),
    precalculated: IsMarked(E.Precalculated),
  }),
);

const OperationsQuery = EntityMapQuery(
  Read(E.Operation),
  Transform(
    ChildrenQuery(
      Keyed({
        entity: Entity(),
        operand: Read(E.Operand),
        value: Value(E.NumberValue),
      }),
    ),
    function Untuple(operands) {
      return Array.from(untuple(operands));
    },
  ),
);

type Operation = [Readonly<E.Operation>, Operand[]];

type Operand = {
  entity: EcsEntity;
  operand: Readonly<E.Operand>;
  value: Readonly<number | undefined>;
};

type EffectValueResolver = {
  resolveByEntities(entities: Iterable<EcsEntity>): void;
  resolveByEffectIds(ids: Iterable<NumberEffectId>): void;
};
export function EffectValueResolver(): SystemParamDescriptor<EffectValueResolver> {
  return {
    inspect() {
      return inspectable(EffectValueResolver, [
        NumberEffectEntities,
        ParentsQuery,
        RefsQuery,
        EffectsQuery,
        OperationsQuery,
      ]);
    },
    create(world) {
      const lookupQuery = NumberEffectEntities.create(world);
      const parentsQuery = ParentsQuery.create(world);
      const refsQuery = RefsQuery.create(world);
      const effectsQuery = EffectsQuery.create(world);
      const operationsQuery = OperationsQuery.create(world);

      return {
        fetch() {
          return new EffectValueResolverImpl(
            lookupQuery.fetch(),
            parentsQuery.fetch(),
            refsQuery.fetch(),
            effectsQuery.fetch(),
            operationsQuery.fetch(),
          );
        },
        cleanup() {
          lookupQuery.cleanup?.();
          parentsQuery.cleanup?.();
          refsQuery.cleanup?.();
          effectsQuery.cleanup?.();
          operationsQuery.cleanup?.();
        },
      };
    },
  };
}

class EffectValueResolverImpl implements EffectValueResolver {
  private readonly referrersLookup = new MultiMap<EcsEntity, EcsEntity>();
  private readonly resolved = new Set<EcsEntity>();

  constructor(
    private readonly lookup: MapQueryResult<
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
    private readonly effects: MapQueryResult<EcsEntity, [EffectType]>,
    private readonly operations: MapQueryResult<EcsEntity, Operation>,
  ) {
    for (const [ref, referrer] of refsLookup) {
      const referenced = lookup.get(ref)!;
      this.referrersLookup.add(referenced, referrer);
    }
  }

  resolveByEntities(entities: Iterable<EcsEntity>) {
    for (const entity of this.findRoots(entities)) {
      this.resolve(entity);
    }
  }

  resolveByEffectIds(ids: Iterable<NumberEffectId>) {
    const entities = map(ids, (id) => this.lookup.get(id)!);
    for (const entity of this.findRoots(entities)) {
      this.resolve(entity);
    }
  }

  private *findRoots(base: Iterable<EcsEntity>): Iterable<EcsEntity> {
    const queue = new Queue<EcsEntity>(...base);

    const roots = new Set<EcsEntity>();
    for (const effect of consume(queue)) {
      const dependents = concat(
        this.parentsLookup.get(effect)!,
        this.referrersLookup.entriesForKey(effect),
      );

      let hasDependents = false;
      for (const dependent of dependents) {
        hasDependents ||= true;

        if (!roots.has(dependent)) {
          queue.enqueue(dependent);
        }
      }

      // NOTE: only remembering the roots will cause issues if there are cycles
      if (!hasDependents) {
        roots.add(effect);
      }
    }

    yield* roots;
  }

  private resolve(entity: EcsEntity) {
    if (!this.resolved.has(entity)) {
      this.gather(entity);
    }
  }

  private gather(entity: EcsEntity): number | undefined {
    const [{ value, ...effect }] = this.effects.get(entity)!;

    if (this.resolved.has(entity)) {
      return value.value;
    }

    if (!effect.precalculated) {
      let gatheredValue: number | undefined;
      if (effect.constant !== undefined) {
        gatheredValue = effect.constant;
      } else {
        if (effect.reference) {
          const referenced = this.lookup.get(effect.reference);
          if (referenced) {
            gatheredValue = this.gather(referenced);
          } else {
            console.log("referenced effect not found", effect.reference);
          }
        } else {
          const operation = this.operations.get(entity);
          if (operation) {
            gatheredValue = this.gatherOperation(operation);
          }
        }
        if (gatheredValue === undefined && effect.default) {
          gatheredValue = effect.default;
        }
      }

      value.value = gatheredValue;
    }

    this.resolved.add(entity);
    return value.value;
  }

  private gatherOperation([{ type }, operands]: Operation): number | undefined {
    for (const operand of operands) {
      this.gather(operand.entity);
    }
    return Calculators[type](operands);
  }
}

type CalculatorFn = (tuples: Iterable<Operand>) => number | undefined;
const Calculators: Record<E.OperationType, CalculatorFn> = {
  sum: (tuples) => {
    let sum = 0;
    for (const { value } of tuples) {
      if (value === undefined) return undefined;
      sum += value;
    }
    return sum;
  },
  product: (tuples) => {
    let prod = 1;
    for (const { value } of tuples) {
      if (value === undefined) return undefined;
      prod *= value;
    }
    return prod;
  },
  ratio: ([a, b]) => {
    const [base, ratio] =
      a.operand.order < b.operand.order
        ? [a.value, b.value]
        : [b.value, a.value];

    return base === undefined || ratio === undefined
      ? undefined
      : base * (1 + ratio);
  },
};

import { NumberEffectId } from "@/app/interfaces";

import {
  Children,
  DiffMut,
  Eager,
  Entity,
  MapQuery,
  Opt,
  Query,
  Read,
  Value,
} from "@/app/ecs/query";
import { QueryDescriptor } from "@/app/ecs/query/types";
import { System } from "@/app/ecs/system";

import {
  Default,
  NumberValue,
  NumberEffect,
  Operation,
  OperationType,
  Reference,
  Operand,
} from "./types";
import { EcsEntity } from "@/app/ecs";

type EffectTuple = [
  NumberValue,
  Readonly<Reference> | undefined,
  Readonly<Operation> | undefined,
  Readonly<Operand> | undefined,
  Readonly<Default> | undefined,
  EcsEntity[],
];

type LookupFns = {
  effect(entity: EcsEntity): EffectTuple | undefined;
  entity(id: NumberEffectId): EcsEntity | undefined;
};

export const RecalculateEffects = function (
  restrictionQuery: QueryDescriptor<NumberEffectId>,
) {
  return System(
    Query(restrictionQuery),
    MapQuery(Value(NumberEffect), Entity()),
    Query(
      DiffMut(NumberValue),
      Opt(Read(Reference)),
      Opt(Read(Operation)),
      Opt(Read(Operand)),
      Opt(Read(Default)),
      Eager(Children()),
    ),
  )((ids, idsLookup, effects) => {
    const calculated = new Set<EcsEntity>();
    const lookupFns: LookupFns = {
      effect: (entity) => effects.get(entity),
      entity: (id) => idsLookup.get(id),
    };

    for (const entity of ids.keys() ?? effects.keys()) {
      gather(lookupFns, entity, calculated);
    }
  });
};

function gather(
  lookupFn: LookupFns,
  current: EcsEntity,
  calculated: Set<EcsEntity>,
): EffectTuple {
  const tuple = lookupFn.effect(current)!;
  const [effect, ref, operation, , def, operands] = tuple;
  if (calculated.has(current)) {
    return tuple;
  }

  if (ref) {
    return gather(lookupFn, lookupFn.entity(ref.value)!, calculated);
  }

  let calculatedValue: number | undefined;
  if (operation) {
    calculatedValue = Calculators[operation.type](
      gatherValues(lookupFn, operands, calculated),
    );
  }

  if (calculatedValue === undefined && def) {
    calculatedValue = def.value;
  }

  effect.value = calculatedValue;
  calculated.add(current);
  return tuple;
}

function* gatherValues(
  lookupFns: LookupFns,
  operands: EcsEntity[],
  calculated: Set<EcsEntity>,
): IterableIterator<EffectTuple> {
  for (const operand of operands) {
    yield gather(lookupFns, operand, calculated);
  }
}

type CalculatorFn = (tuples: Iterable<EffectTuple>) => number | undefined;

const Calculators: Record<OperationType, CalculatorFn> = {
  sum: (tuples) => {
    let sum = 0;
    for (const [{ value }] of tuples) {
      if (value === undefined) return undefined;
      sum += value;
    }
    return sum;
  },
  product: (tuples) => {
    let prod = 1;
    for (const [{ value }] of tuples) {
      if (value === undefined) return undefined;
      prod *= value;
    }
    return prod;
  },
  ratio: (tuples) => {
    const arrays = Array.from(tuples).sort(
      // always sort 'base' value first
      // these should always be two, so this rule should be enough.
      ([, , , operand], _) => (operand!.type === "base" ? -1 : 1),
    );

    // Extract base and ratio values from tuples.
    const [[{ value: base }], [{ value: ratio }]] = arrays;

    return base === undefined || ratio === undefined
      ? undefined
      : base * (1 + ratio);
  },
};

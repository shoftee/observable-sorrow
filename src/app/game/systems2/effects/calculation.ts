import { NumberEffectId } from "@/app/interfaces";

import { EcsEntity } from "@/app/ecs";
import {
  ChildrenQuery,
  DiffMut,
  Eager,
  Entity,
  EntityMapQuery,
  Opt,
  Read,
} from "@/app/ecs/query";
import { QueryDescriptor } from "@/app/ecs/query/types";
import { System } from "@/app/ecs/system";

import {
  Default,
  NumberValue,
  Operation,
  OperationType,
  Reference,
  Operand,
  Constant,
  Precalculated,
} from "./types";
import { DependentEffectsQuery, NumberEffectEntities } from "./ecs";

type EffectTuple = [
  NumberValue,
  Readonly<Reference> | undefined,
  Readonly<Default> | undefined,
  Readonly<Constant> | undefined,
  Readonly<Precalculated> | undefined,
];

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
    NumberEffectEntities,
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
  selector: QueryDescriptor<NumberEffectId>,
) {
  return System(
    DependentEffectsQuery(selector),
    NumberEffectEntities,
    EffectsTupleQuery,
    OperationsTupleQuery,
  )((entities, idsLookup, effectsQuery, operationsQuery) => {
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

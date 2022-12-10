import { map } from "@/app/utils/collections";

import { NumberEffectId } from "@/app/interfaces";

import { EcsEntity, inspectable } from "@/app/ecs";
import {
  EntityMapQuery,
  DiffMut,
  Opt,
  Read,
  IsMarked,
  Eager,
  ChildrenQuery,
  Entity,
  Query,
  MapQueryResult,
} from "@/app/ecs/query";
import { QueryDescriptor, SystemParamDescriptor } from "@/app/ecs/query/types";
import { System } from "@/app/ecs/system";

import {
  NumberValue,
  Reference,
  Default,
  Constant,
  Precalculated,
  Operation,
  Operand,
  OperationType,
} from "../types";

import { EffectDependencyResolver } from "./dependency-resolver";
import { NumberEffectEntities } from "./ecs";

type EffectTuple = [
  NumberValue,
  Readonly<Reference> | undefined,
  Readonly<Default> | undefined,
  Readonly<Constant> | undefined,
  boolean,
];

const EffectTuples = EntityMapQuery(
  DiffMut(NumberValue),
  Opt(Read(Reference)),
  Opt(Read(Default)),
  Opt(Read(Constant)),
  IsMarked(Precalculated),
);

const OperationTuples = EntityMapQuery(
  Read(Operation),
  Eager(ChildrenQuery(Entity(), Read(Operand), Read(NumberValue))),
);

type OperandTuple = [
  Readonly<EcsEntity>,
  Readonly<Operand>,
  Readonly<NumberValue>,
];

type OperationTuple = [Readonly<Operation>, OperandTuple[]];

export const RecalculateByList = function (...ids: NumberEffectId[]) {
  return System(
    EffectDependencyResolver(),
    EffectValueResolver(),
  )((dependencies, values) => {
    for (const entity of dependencies.find(ids)) {
      values.resolve(entity);
    }
  });
};

export const RecalculateByQuery = function (
  selector: QueryDescriptor<NumberEffectId>,
) {
  return System(
    Query(selector),
    EffectDependencyResolver(),
    EffectValueResolver(),
  )((entityQuery, dependencies, values) => {
    const ids = map(entityQuery, ([id]) => id);
    for (const entity of dependencies.find(ids)) {
      values.resolve(entity);
    }
  });
};

type EffectValueResolver = {
  resolve(entity: EcsEntity): void;
};
export function EffectValueResolver(): SystemParamDescriptor<EffectValueResolver> {
  return {
    inspect() {
      return inspectable(EffectValueResolver, [
        NumberEffectEntities,
        EffectTuples,
        OperationTuples,
      ]);
    },
    create(world) {
      const lookupQuery = NumberEffectEntities.create(world);
      const effectsQuery = EffectTuples.create(world);
      const operationsQuery = OperationTuples.create(world);

      return {
        fetch() {
          return new EffectValueResolverImpl(
            lookupQuery.fetch(),
            effectsQuery.fetch(),
            operationsQuery.fetch(),
          );
        },
        cleanup() {
          lookupQuery.cleanup?.();
          effectsQuery.cleanup?.();
          operationsQuery.cleanup?.();
        },
      };
    },
  };
}

class EffectValueResolverImpl implements EffectValueResolver {
  private readonly resolved = new Set<EcsEntity>();

  constructor(
    private readonly lookup: MapQueryResult<
      NumberEffectId,
      Readonly<EcsEntity>
    >,
    private readonly effects: MapQueryResult<EcsEntity, EffectTuple>,
    private readonly operations: MapQueryResult<EcsEntity, OperationTuple>,
  ) {}

  resolve(entity: EcsEntity) {
    this.gather(entity);
  }

  private gather(current: EcsEntity): number | undefined {
    const [val, ref, def, constant, precalculated] = this.effects.get(current)!;
    if (!this.resolved.has(current)) {
      if (precalculated) {
        // effect already has a value to use
        // assume gathered and proceed
        this.resolved.add(current);
      } else {
        let gatheredValue: number | undefined;
        if (constant) {
          // effect value should be constant
          // assign to make sure actual value matches the constant
          gatheredValue = constant.value;
        } else {
          // effect requires calculation
          if (ref) {
            const referenced = this.lookup.get(ref.value)!;
            gatheredValue = this.gather(referenced);
          } else {
            const operationTuple = this.operations.get(current);
            if (operationTuple) {
              const [operation, operandsTuples] = operationTuple;
              gatheredValue = Calculators[operation.type](
                this.gatherValues(toOperands(operandsTuples)),
              );
            }
          }
          if (gatheredValue === undefined && def) {
            // effect calculation yielded no result, use default value
            gatheredValue = def.value;
          }
        }

        this.resolved.add(current);
        val.value = gatheredValue;
        return gatheredValue;
      }
    }

    return val.value;
  }

  private *gatherValues(
    operands: Iterable<CalculationOperand>,
  ): IterableIterator<CalculationOperand> {
    for (const operand of operands) {
      this.gather(operand.entity);
      yield operand;
    }
  }
}

type CalculationOperand = Readonly<{
  entity: EcsEntity;
  type: "base" | "ratio" | "exponent" | undefined;
  value: number | undefined;
}>;

function* toOperands(
  tuples: Iterable<OperandTuple>,
): Iterable<CalculationOperand> {
  for (const [entity, { type }, { value }] of tuples) {
    yield { entity, type, value };
  }
}

type CalculatorFn = (
  tuples: Iterable<CalculationOperand>,
) => number | undefined;

const Calculators: Record<OperationType, CalculatorFn> = {
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
  ratio: (tuples) => {
    const arrays = Array.from(tuples).sort(
      // always sort 'base' value first
      // these should always be two, so this rule should be enough.
      ({ type }, _) => (type === "base" ? -1 : 0),
    );

    // Extract base and ratio values from tuples.
    const [{ value: base }, { value: ratio }] = arrays;

    return base === undefined || ratio === undefined
      ? undefined
      : base * (1 + ratio);
  },
};

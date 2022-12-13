import { map } from "@/app/utils/collections";

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
  Query,
  MapQueryResult,
  Keyed,
  Value,
  Transform,
} from "@/app/ecs/query";
import { QueryDescriptor, SystemParamDescriptor } from "@/app/ecs/query/types";
import { System } from "@/app/ecs/system";

import * as E from "../types";

import { EffectDependencyResolver } from "./dependency-resolver";
import { NumberEffectEntities } from "./ecs";

type EffectType = {
  value: E.NumberValue;
  reference?: NumberEffectId;
  default?: number;
  constant?: number;
  precalculated: boolean;
};

const EffectsQuery = EntityMapQuery(
  Keyed({
    value: DiffMut(E.NumberValue),
    reference: Opt(Value(E.Reference)),
    default: Opt(Value(E.Default)),
    constant: Opt(Value(E.Constant)),
    precalculated: IsMarked(E.Precalculated),
  }),
);

const OperationsQuery = EntityMapQuery(
  Keyed({
    operation: Read(E.Operation),
    operands: Transform(
      ChildrenQuery(
        Keyed({
          entity: Entity(),
          operand: Value(E.Operand),
          order: Value(E.Order),
          value: Value(E.NumberValue),
        }),
      ),
      function UnpackOperands(operands) {
        return Array.from(operands, ([operand]) => operand);
      },
    ),
  }),
);

type Operation = {
  operation: Readonly<E.Operation>;
  operands: Operand[];
};

type Operand = {
  entity: EcsEntity;
  operand: E.Operand["value"];
  order: number;
  value?: number;
};

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
        EffectsQuery,
        OperationsQuery,
      ]);
    },
    create(world) {
      const lookupQuery = NumberEffectEntities.create(world);
      const effectsQuery = EffectsQuery.create(world);
      const operationsQuery = OperationsQuery.create(world);

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
    private readonly effects: MapQueryResult<EcsEntity, [EffectType]>,
    private readonly operations: MapQueryResult<EcsEntity, [Operation]>,
  ) {}

  resolve(entity: EcsEntity) {
    this.gather(entity);
  }

  private gather(current: EcsEntity): number | undefined {
    const [{ value, ...effect }] = this.effects.get(current)!;
    if (!this.resolved.has(current)) {
      if (effect.precalculated) {
        // effect already has a value to use
        // assume gathered and proceed
        this.resolved.add(current);
      } else {
        let gatheredValue: number | undefined;
        if (effect.constant) {
          gatheredValue = effect.constant;
        } else {
          // effect requires calculation
          if (effect.reference) {
            const referenced = this.lookup.get(effect.reference)!;
            gatheredValue = this.gather(referenced);
          } else {
            const operationTuple = this.operations.get(current);
            if (operationTuple) {
              const [{ operation, operands }] = operationTuple;
              gatheredValue = Calculators[operation.type](
                this.gatherValues(operands),
              );
            }
          }
          if (gatheredValue === undefined && effect.default) {
            // effect calculation yielded no result, use default value
            gatheredValue = effect.default;
          }
        }

        this.resolved.add(current);
        value.value = gatheredValue;
        return gatheredValue;
      }
    }

    return value.value;
  }

  private *gatherValues(operands: Iterable<Operand>): Iterable<Operand> {
    for (const operand of operands) {
      this.gather(operand.entity);
      yield operand;
    }
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
  ratio: (tuples) => {
    const arrays = Array.from(tuples).sort((a, b) => a.order - b.order);

    // Extract base and ratio values from tuples.
    const [{ value: base }, { value: ratio }] = arrays;

    return base === undefined || ratio === undefined
      ? undefined
      : base * (1 + ratio);
  },
};

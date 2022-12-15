import { defined, map, untuple } from "@/app/utils/collections";

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
  Fresh,
  EntityLookup,
} from "@/app/ecs/query";
import { QueryDescriptor, SystemParamDescriptor } from "@/app/ecs/query/types";
import { System } from "@/app/ecs/system";

import * as E from "../types";

import { EffectDependencyResolver } from "./dependency-resolver";
import { NumberEffectEntities } from "./ecs";

type EffectType = {
  id?: NumberEffectId;
  value: E.NumberValue;
  reference?: NumberEffectId;
  default?: number;
  constant?: number;
  precalculated: boolean;
};

const FreshQuery = EntityLookup(Value(E.NumberEffect)).filter(
  Fresh(E.NumberValue),
);

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
        operand: Value(E.Operand),
        order: Value(E.Order),
        value: Value(E.NumberValue),
      }),
    ),
    function UnpackOperands(operands) {
      return Array.from(untuple(operands));
    },
  ),
);

type Operation = [Readonly<E.Operation>, Operand[]];

type Operand = {
  entity: EcsEntity;
  operand: Readonly<E.Operand["value"]>;
  order: Readonly<number>;
  value: Readonly<number | undefined>;
};

// A system which will recalculate the dependencies for the specified effect IDs, but only if they are recently changed.
export function RecalculateFresh(...ids: NumberEffectId[]) {
  return System(
    FreshQuery,
    EffectDependencyResolver(),
    EffectValueResolver(),
  )((freshLookup, dependencies, values) => {
    const entities = defined(map(ids, (id) => freshLookup.get(id)));
    for (const entity of dependencies.findByEntities(entities)) {
      values.resolve(entity);
    }
  });
}

// A system which will recalculate the dependencies of all effect IDs returned by the specified query.
export function RecalculateById(selector: QueryDescriptor<NumberEffectId>) {
  return System(
    Query(selector),
    EffectDependencyResolver(),
    EffectValueResolver(),
  )((idsQuery, dependencies, values) => {
    const ids = untuple(idsQuery);
    for (const entity of dependencies.findByIds(ids)) {
      values.resolve(entity);
    }
  });
}

// A system which will recalculate the dependencies of all effect entities returned by the query.
export function RecalculateByEntity(selector: QueryDescriptor<EcsEntity>) {
  return System(
    Query(selector),
    EffectDependencyResolver(),
    EffectValueResolver(),
  )((entityQuery, dependencies, values) => {
    const entities = untuple(entityQuery);
    for (const entity of dependencies.findByEntities(entities)) {
      values.resolve(entity);
    }
  });
}

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
    private readonly operations: MapQueryResult<EcsEntity, Operation>,
  ) {}

  resolve(entity: EcsEntity) {
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
  ratio: (tuples) => {
    const array = Array.from(tuples).sort((a, b) => a.order - b.order);

    // Extract base and ratio values from tuples.
    const [{ value: base }, { value: ratio }] = array;

    return base === undefined || ratio === undefined
      ? undefined
      : base * (1 + ratio);
  },
};

import { BuildingId, NumberEffectId } from "@/app/interfaces";

import { EcsComponent, ValueComponent } from "@/app/ecs";
import { ChangeTrackers, MapQuery, Value } from "@/app/ecs/query";

export const Markers = {
  Effect: class extends EcsComponent {},
};

export class NumberEffect extends ValueComponent<NumberEffectId> {
  constructor(readonly value: NumberEffectId) {
    super();
  }
}

export class Order extends ValueComponent<number> {
  constructor(readonly value: number) {
    super();
  }
}

export class NumberValue extends ValueComponent<number | undefined> {
  value: number | undefined;
}

export class Default extends ValueComponent<number> {
  constructor(readonly value: number) {
    super();
  }
}

export type OperationType = "sum" | "product" | "ratio";

export class Operation extends EcsComponent {
  constructor(readonly type: OperationType) {
    super();
  }
}

export class Operand extends EcsComponent {
  constructor(readonly type: "base" | "ratio" | "exponent") {
    super();
  }
}

export class Reference extends ValueComponent<NumberEffectId> {
  constructor(readonly value: NumberEffectId) {
    super();
  }
}

export class BuildingLevel extends EcsComponent {
  constructor(readonly building: BuildingId) {
    super();
  }
}

export const NumberTrackersQuery = MapQuery(
  Value(NumberEffect),
  ChangeTrackers(NumberValue),
);

export type EffectCompositeItem = EcsComponent | Expr;

export type Expr = () => Iterable<EffectCompositeItem>;

function constant(value: number): Expr {
  return () => [new Default(value)];
}

function reference(id: NumberEffectId): Expr {
  return () => [new Reference(id)];
}

function sum(...exprs: Expr[]): Expr {
  return function* () {
    yield new Operation("sum");
    for (const id of exprs) {
      let i = 0;
      yield function* () {
        yield* id();
        yield new Order(i);
      };
      i++;
    }
  };
}

// function product(...operandExprs: Expr[]) {
//   return function* () {
//     yield new Operation("product");
//     for (const id of operandExprs) {
//       yield* id();
//     }
//   };
// }

function ratio(baseExpr: Expr, ratioExpr: Expr): Expr {
  return function* () {
    yield new Operation("ratio");
    yield function* () {
      yield* baseExpr();
      yield new Operand("base");
      yield new Order(1);
    };
    yield function* () {
      yield* ratioExpr();
      yield new Operand("ratio");
      yield new Order(2);
    };
  };
}

function building(building: BuildingId, singleExpr: Expr): Expr {
  return function* () {
    yield new Operation("product");
    yield function* () {
      yield* singleExpr();
      yield new Order(1);
    };
    yield function* () {
      yield new BuildingLevel(building);
      yield new Default(0);
      yield new Order(2);
    };
  };
}

export const NumberExprs: Partial<Record<NumberEffectId, Expr>> = {
  "catnip.limit": reference("catnip.limit.base"),
  "catnip.limit.base": constant(5000),

  "wood.limit": reference("wood.limit.base"),
  "wood.limit.base": constant(200),

  "minerals.limit": reference("minerals.limit.base"),
  "minerals.limit.base": constant(250),

  "science.limit": constant(0),

  "catpower.limit": constant(0),

  "kittens.limit": constant(0),

  "catnip.delta": reference("catnip.production"),
  "catnip.production": ratio(
    reference("catnip-field.catnip"),
    reference("weather.ratio"),
  ),
  "catnip-field.catnip": building(
    "catnip-field",
    reference("catnip-field.catnip.base"),
  ),
  "catnip-field.catnip.base": constant(0.125),
  "weather.ratio": sum(
    reference("weather.season-ratio"),
    reference("weather.severity-ratio"),
  ),
  "weather.season-ratio": constant(0), // TODO
  "weather.severity-ratio": constant(0), // TODO
};

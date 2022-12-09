import {
  BooleanEffectId,
  BuildingId,
  NumberEffectId,
  SeasonId,
  WeatherId,
} from "@/app/interfaces";

import {
  EcsComponent,
  ImmutableSym,
  MarkerComponent,
  ReadonlyValueComponent,
  ValueComponent,
} from "@/app/ecs";

export class Effect extends MarkerComponent {}

export class NumberEffect extends ReadonlyValueComponent<NumberEffectId> {}

export class NumberValue extends ValueComponent<number | undefined> {
  value: number | undefined;
}

export class BooleanEffect extends ReadonlyValueComponent<BooleanEffectId> {}
export class BooleanValue extends ValueComponent<boolean | undefined> {
  value: boolean | undefined;
}

export class Default extends ReadonlyValueComponent<number> {}
export class Constant extends ReadonlyValueComponent<number> {}

export type OperationType = "sum" | "product" | "ratio";

export class Operation extends EcsComponent {
  [ImmutableSym] = true;
  constructor(readonly type: OperationType) {
    super();
  }
}

export class Operand extends EcsComponent {
  [ImmutableSym] = true;
  constructor(readonly type?: "base" | "ratio" | "exponent") {
    super();
  }
}

export class Order extends ReadonlyValueComponent<number> {}

export class Reference extends ReadonlyValueComponent<NumberEffectId> {}

export class EffectTree extends EcsComponent {
  [ImmutableSym] = true;
  readonly references = new Set<NumberEffectId>();
}

export class Precalculated extends MarkerComponent {}

export class BuildingEffect extends ReadonlyValueComponent<BuildingId> {}

export class WeatherEffect extends ValueComponent<WeatherId> {
  value: WeatherId = "neutral";
}

export class SeasonEffect extends ValueComponent<SeasonId> {
  value: SeasonId = "spring";
}

export type EffectCompositeItem = EcsComponent | Expr;

export type Expr = () => Iterable<EffectCompositeItem>;

function constant(value: number): Expr {
  return function* () {
    yield new Constant(value);
  };
}

function reference(id: NumberEffectId): Expr {
  return function* () {
    yield new Reference(id);
  };
}

function sum(...exprs: Expr[]): Expr {
  return function* () {
    yield new Operation("sum");
    let i = 0;
    for (const id of exprs) {
      yield function* () {
        yield* id();
        yield new Operand();
        yield new Order(i);
      };
      i++;
    }
  };
}

// function product(...exprs: Expr[]) {
//   return function* () {
//     yield new Operation("product");
//     let i = 0;
//     for (const id of exprs) {
//       yield function* () {
//         yield* id();
//         yield new Operand();
//         yield new Order(i);
//       };
//       i++;
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
      yield new Operand();
      yield new Order(1);
    };
    yield function* () {
      yield new Precalculated();
      yield new BuildingEffect(building);
      yield new Operand();
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
  "weather.season-ratio": function* () {
    yield new Default(0);
    yield new Precalculated();
    yield new SeasonEffect();
  },
  "weather.severity-ratio": function* () {
    yield new Default(0);
    yield new Precalculated();
    yield new WeatherEffect();
  },

  "wood.delta": reference("wood.production"),
  "wood.production": constant(0), // TODO jobs

  "minerals.delta": reference("minerals.production"),
  "minerals.production": constant(0), // TODO jobs and minerals.ratio

  "science.delta": reference("science.production"),
  "science.production": constant(0), // TODO jobs and science.ratio
  // TODO: astronomy rewards

  "catpower.delta": reference("catpower.production"),
  "catpower.production": constant(0), // TODO jobs
};

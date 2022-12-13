import { enumerate } from "@/app/utils/collections";

import {
  BooleanEffectId,
  BuildingId,
  NumberEffectId,
  SeasonId,
  WeatherId,
} from "@/app/interfaces";

import {
  EcsComponent,
  IMMUTABLE,
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
  [IMMUTABLE] = true;
  constructor(readonly type: OperationType) {
    super();
  }
}

type OperandType = "base" | "ratio" | "exponent" | undefined;
export class Operand extends ReadonlyValueComponent<OperandType> {
  constructor(value?: NonNullable<OperandType>) {
    super(value);
  }
}

export class Order extends ReadonlyValueComponent<number> {}

export class Reference extends ReadonlyValueComponent<NumberEffectId> {}

export class EffectTree extends EcsComponent {
  [IMMUTABLE] = true;
  readonly references = new Set<NumberEffectId>();
}

export class Precalculated extends MarkerComponent {}

export class BuildingLevelEffect extends ReadonlyValueComponent<BuildingId> {}

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

function TODO(_reason: string): Expr {
  return () => [];
}

function reference(id: NumberEffectId): Expr {
  return function* () {
    yield new Reference(id);
  };
}

function sum(...exprs: Expr[]): Expr {
  return function* () {
    yield new Operation("sum");
    for (const [expr, i] of enumerate(exprs)) {
      yield function* () {
        yield* expr();
        yield new Operand();
        yield new Order(i + 1);
      };
    }
  };
}

function product(...exprs: Expr[]) {
  return function* () {
    yield new Operation("product");
    for (const [expr, i] of enumerate(exprs)) {
      yield function* () {
        yield* expr();
        yield new Operand();
        yield new Order(i + 1);
      };
    }
  };
}

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

function buildingLevel(building: BuildingId): Expr {
  return function* () {
    yield new Precalculated();
    yield new BuildingLevelEffect(building);
  };
}

export const NumberExprs: Partial<Record<NumberEffectId, Expr>> = {
  "catnip.limit": reference("catnip.limit.base"),
  "catnip.limit.base": constant(5000),

  "wood.limit": reference("wood.limit.base"),
  "wood.limit.base": constant(200),

  "minerals.limit": reference("minerals.limit.base"),
  "minerals.limit.base": constant(250),

  "catpower.limit": sum(reference("hut.catpower-limit")),
  "hut.catpower-limit.base": constant(75),
  "hut.catpower-limit": product(
    reference("hut.catpower-limit.base"),
    buildingLevel("hut"),
  ),

  "kittens.limit": sum(reference("hut.kittens-limit")),
  "hut.kittens-limit.base": constant(2),
  "hut.kittens-limit": product(
    reference("hut.kittens-limit.base"),
    buildingLevel("hut"),
  ),

  "catnip.delta": reference("catnip.production"),
  "catnip.production": ratio(
    reference("catnip-field.catnip"),
    reference("weather.ratio"),
  ),
  "catnip-field.catnip": product(
    reference("catnip-field.catnip.base"),
    buildingLevel("catnip-field"),
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

  "science.limit": sum(reference("library.science-limit")),
  "library.science-limit.base": constant(250),
  "library.science-limit": product(
    reference("library.science-limit.base"),
    buildingLevel("library"),
  ),

  "science.ratio": sum(reference("library.science-ratio")),
  "library.science-ratio.base": constant(0.1),
  "library.science-ratio": product(
    reference("library.science-ratio.base"),
    buildingLevel("library"),
  ),

  "wood.delta": reference("wood.production"),
  "wood.production": TODO("needs jobs"),

  "minerals.delta": reference("minerals.production"),
  "minerals.production": TODO("needs jobs and minerals.ratio"),

  "science.delta": reference("science.production"),
  "science.production": TODO("needs jobs"),

  "astronomy.rare-event.reward.base": constant(25),
  "astronomy.rare-event.reward": ratio(
    reference("astronomy.rare-event.reward.base"),
    reference("science.ratio"),
  ),

  "catpower.delta": reference("catpower.production"),
  "catpower.production": TODO("needs jobs"),
};

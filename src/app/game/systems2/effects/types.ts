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
  constructor() {
    super(undefined);
  }
}

export class BooleanEffect extends ReadonlyValueComponent<BooleanEffectId> {}

export class BooleanValue extends ValueComponent<boolean | undefined> {
  constructor() {
    super(undefined);
  }
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

export class Order extends ReadonlyValueComponent<number> {
  constructor(readonly value: number) {
    super(value);
  }
}

export class Reference extends ReadonlyValueComponent<NumberEffectId> {}

export class EffectTree extends EcsComponent {
  [IMMUTABLE] = true;
  readonly references = new Set<NumberEffectId>();
}

export class Precalculated extends MarkerComponent {}

export class BuildingLevelEffect extends ReadonlyValueComponent<BuildingId> {}

export class WeatherEffect extends ValueComponent<WeatherId> {
  constructor() {
    super("neutral");
  }
}

export class SeasonEffect extends ValueComponent<SeasonId> {
  constructor() {
    super("spring");
  }
}

export type EffectCompositeItem = EcsComponent | Expr;

export type Expr = () => Iterable<EffectCompositeItem>;

function CONST(value: number): Expr {
  return function* () {
    yield new Constant(value);
  };
}

function REFERENCE(id: NumberEffectId): Expr {
  return function* () {
    yield new Reference(id);
  };
}

function SUM(...exprs: Expr[]): Expr {
  return function* () {
    yield new Operation("sum");
    for (const [expr, i] of enumerate(exprs)) {
      yield function* () {
        yield* expr();
        yield new Order(i + 1);
      };
    }
  };
}

function PRODUCT(...exprs: Expr[]) {
  return function* () {
    yield new Operation("product");
    for (const [expr, i] of enumerate(exprs)) {
      yield function* () {
        yield* expr();
        yield new Order(i + 1);
      };
    }
  };
}

function RATIO(base: Expr, ratio: Expr): Expr {
  return function* () {
    yield new Operation("ratio");
    yield function* () {
      yield* base();
      yield new Order(1);
    };
    yield function* () {
      yield* ratio();
      yield new Order(2);
    };
  };
}

function BUILDING_LEVEL(building: BuildingId): Expr {
  return function* () {
    yield new Precalculated();
    yield new BuildingLevelEffect(building);
  };
}

export const NumberExprs: Partial<Record<NumberEffectId, Expr>> = {
  "catnip.limit": SUM(REFERENCE("catnip.limit.base")),
  "catnip.limit.base": CONST(5000),

  "wood.limit": SUM(REFERENCE("wood.limit.base")),
  "wood.limit.base": CONST(200),

  "minerals.limit": SUM(REFERENCE("minerals.limit.base")),
  "minerals.limit.base": CONST(250),

  "catpower.limit": SUM(REFERENCE("hut.catpower-limit")),
  "hut.catpower-limit.base": CONST(75),
  "hut.catpower-limit": PRODUCT(
    REFERENCE("hut.catpower-limit.base"),
    BUILDING_LEVEL("hut"),
  ),

  "kittens.limit": SUM(REFERENCE("hut.kittens-limit")),
  "hut.kittens-limit.base": CONST(2),
  "hut.kittens-limit": PRODUCT(
    REFERENCE("hut.kittens-limit.base"),
    BUILDING_LEVEL("hut"),
  ),

  "catnip.delta": REFERENCE("catnip.production"),
  "catnip.production": RATIO(
    REFERENCE("catnip-field.catnip"),
    REFERENCE("weather.ratio"),
  ),
  "catnip-field.catnip": PRODUCT(
    REFERENCE("catnip-field.catnip.base"),
    BUILDING_LEVEL("catnip-field"),
  ),
  "catnip-field.catnip.base": CONST(0.125),
  "weather.ratio": SUM(
    REFERENCE("weather.season-ratio"),
    REFERENCE("weather.severity-ratio"),
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

  "science.limit": SUM(REFERENCE("library.science-limit")),
  "library.science-limit.base": CONST(250),
  "library.science-limit": PRODUCT(
    REFERENCE("library.science-limit.base"),
    BUILDING_LEVEL("library"),
  ),

  "science.ratio": SUM(REFERENCE("library.science-ratio")),
  "library.science-ratio.base": CONST(0.1),
  "library.science-ratio": PRODUCT(
    REFERENCE("library.science-ratio.base"),
    BUILDING_LEVEL("library"),
  ),

  // "wood.delta": REFERENCE("wood.production"),

  // "minerals.delta": REFERENCE("minerals.production"),

  // "science.delta": REFERENCE("science.production"),

  "astronomy.rare-event.reward.base": CONST(25),
  "astronomy.rare-event.reward": RATIO(
    REFERENCE("astronomy.rare-event.reward.base"),
    REFERENCE("science.ratio"),
  ),

  // "catpower.delta": REFERENCE("catpower.production"),
};

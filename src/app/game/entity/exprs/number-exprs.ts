import {
  BuildingId,
  JobId,
  NumberEffectId,
  ResourceId,
} from "@/app/interfaces";

import { effect, unwrap, Expr, ExprContext } from "./common";

export type NumberExpr = Expr<number | undefined, NumberEffectId>;
type Ctx = ExprContext<number | undefined, NumberEffectId>;

const building = (id: BuildingId) => (ctx: Ctx) => {
  const building = ctx.admin.building(id).state;
  return building.unlocked ? building.level : undefined;
};

const resource = (id: ResourceId) => (ctx: Ctx) => {
  const resource = ctx.admin.resource(id).state;
  return resource.unlocked ? resource.amount : undefined;
};

const workers = (id: JobId) => (ctx: Ctx) =>
  ctx.admin.pops().withJob(id).count();

const withHappiness = (expr: NumberExpr) => {
  return looseProd(expr, (ctx: Ctx) => ctx.val("population.happiness.total"));
};

// Unwraps the provided exprs one by one and returns the first that resolves to a non-undefined value.
// Returns undefined if all exprs resolve to undefined.
const coalesce =
  (...exprs: NumberExpr[]) =>
  (ctx: Ctx) => {
    for (const expr of exprs) {
      const checked = unwrap(expr, ctx);
      if (checked !== undefined) {
        return checked;
      }
    }
    return undefined;
  };

type Unlockable = { state: { unlocked: boolean } };

const unlocked =
  (check: (ctx: Ctx) => Unlockable, then: NumberExpr) => (ctx: Ctx) =>
    check(ctx).state.unlocked ? unwrap(then, ctx) : undefined;

// Returns undefined iff all provided exprs unwrap to undefined.
// Otherwise, returns the sum of the valued exprs.
const looseSum =
  (...exprs: NumberExpr[]) =>
  (ctx: Ctx) => {
    let sum = undefined;
    for (const expr of exprs) {
      const value = unwrap(expr, ctx);
      if (value === undefined) continue;
      else if (sum === undefined) sum = value;
      else sum += value;
    }
    return sum;
  };

// Returns defined iff all provided exprs unwrap to defined.
// Otherwise, returns undefined.
const strictSum =
  (...exprs: NumberExpr[]) =>
  (ctx: Ctx) => {
    let sum = 0;
    for (const expr of exprs) {
      const value = unwrap(expr, ctx);
      if (value === undefined) return undefined;
      sum += value;
    }
    return sum;
  };

// Returns undefined iff all provided exprs resolve to undefined.
// Otherwise, returns the product of all resolved exprs.
const looseProd =
  (...exprs: NumberExpr[]) =>
  (ctx: Ctx) => {
    let sum = undefined;
    for (const expr of exprs) {
      const value = unwrap(expr, ctx);
      if (value === undefined) continue;
      else if (sum === undefined) sum = value;
      else sum *= value;
    }
    return sum;
  };

// Returns defined iff all provided exprs unwrap to defined.
// Otherwise, returns undefined.
const strictProd =
  (...exprs: NumberExpr[]) =>
  (ctx: Ctx) => {
    let prod = 1;
    for (const expr of exprs) {
      const value = unwrap(expr, ctx);
      if (value === undefined) return undefined;
      prod *= value;
    }
    return prod;
  };

const subtract = (lhs: NumberExpr, rhs: NumberExpr) => (ctx: Ctx) => {
  const lhsVal = unwrap(lhs, ctx);
  const rhsVal = unwrap(rhs, ctx);
  return lhsVal === undefined || rhsVal === undefined
    ? undefined
    : lhsVal - rhsVal;
};

const ratio = (base: NumberExpr, ratio: NumberExpr) => (ctx: Ctx) => {
  const baseVal = unwrap(base, ctx);
  const ratioVal = unwrap(ratio, ctx);
  return baseVal === undefined || ratioVal === undefined
    ? undefined
    : baseVal * (1 + ratioVal);
};

const constant = (value: number | undefined) => (_: Ctx) => value;

export const NumberExprs: Record<NumberEffectId, NumberExpr> = {
  // Limits
  "catnip.limit.base": constant(5000),
  "catnip.limit": looseSum(
    effect("catnip.limit.base"),
    effect("barn.catnip-limit"),
  ),

  "wood.limit.base": constant(200),
  "wood.limit": looseSum(effect("wood.limit.base"), effect("barn.wood-limit")),

  "minerals.limit.base": constant(250),
  "minerals.limit": looseSum(
    effect("minerals.limit.base"),
    effect("barn.minerals-limit"),
  ),

  "science.limit": effect("library.science-limit"),
  "kittens.limit": effect("hut.kittens-limit"),

  // Catnip
  "catnip.delta": subtract(
    effect("catnip.production"),
    effect("population.catnip-demand"),
  ),
  "catnip.production": looseSum(
    ratio(effect("catnip-field.catnip"), effect("weather.ratio")),
    effect("jobs.farmer.catnip"),
  ),

  // Wood
  "wood.delta": effect("wood.production"),
  "wood.production": looseSum(effect("jobs.woodcutter.wood")),

  // Minerals
  "minerals.delta": effect("minerals.production"),
  "minerals.production": ratio(
    effect("jobs.miner.minerals"),
    coalesce(effect("minerals.ratio"), constant(0)),
  ),
  "minerals.ratio": effect("mine.minerals-ratio"),

  // Science
  "science.delta": effect("science.production"),
  "science.production": ratio(
    effect("jobs.scholar.science"),
    coalesce(effect("science.ratio"), constant(0)),
  ),
  "astronomy.rare-event.reward.base": constant(25),
  "astronomy.rare-event.reward": ratio(
    effect("astronomy.rare-event.reward.base"),
    coalesce(effect("science.ratio"), constant(0)),
  ),
  "science.ratio": effect("library.science-ratio"),

  // Catnip fields
  "catnip-field.catnip.base": constant(0.125),
  "catnip-field.catnip": strictProd(
    effect("catnip-field.catnip.base"),
    coalesce(building("catnip-field"), constant(0)),
  ),

  // Huts
  "hut.kittens-limit.base": constant(2),
  "hut.kittens-limit": strictProd(
    effect("hut.kittens-limit.base"),
    coalesce(building("hut"), constant(0)),
  ),

  // Libraries
  "library.science-limit.base": constant(250),
  "library.science-limit": strictProd(
    effect("library.science-limit.base"),
    coalesce(building("library"), constant(0)),
  ),
  "library.science-ratio.base": constant(0.1),
  "library.science-ratio": strictProd(
    effect("library.science-ratio.base"),
    coalesce(building("library"), constant(0)),
  ),

  // Barns
  "barn.catnip-limit.base": constant(5000),
  "barn.catnip-limit": strictProd(
    effect("barn.catnip-limit.base"),
    building("barn"),
  ),
  "barn.wood-limit.base": constant(200),
  "barn.wood-limit": strictProd(
    effect("barn.wood-limit.base"),
    building("barn"),
  ),
  "barn.minerals-limit.base": unlocked(
    (ctx) => ctx.admin.resource("minerals"),
    constant(250),
  ),
  "barn.minerals-limit": strictProd(
    effect("barn.minerals-limit.base"),
    building("barn"),
  ),

  // Mines
  "mine.minerals-ratio.base": constant(0.2),
  "mine.minerals-ratio": strictProd(
    effect("mine.minerals-ratio.base"),
    building("mine"),
  ),

  // Population
  // Happiness
  "population.happiness.base": constant(1),
  "population.overpopulation.base": constant(-0.02),
  "population.overpopulation.severity": ({ admin }) => {
    const popCount = admin.pops().size;
    if (popCount < 5) {
      // overpopulation is not in effect
      return undefined;
    }
    return popCount - 5;
  },
  "population.overpopulation": strictProd(
    effect("population.overpopulation.base"),
    effect("population.overpopulation.severity"),
  ),
  "population.happiness.total": strictSum(
    effect("population.happiness.base"),
    effect("population.overpopulation"),
  ),
  // Catnip demand
  "population.catnip-demand.base": constant(0.85),
  "population.catnip-demand": strictProd(
    effect("population.catnip-demand.base"),
    coalesce(resource("kittens"), constant(0)),
  ),

  // Weather
  "weather.season-ratio": ({ admin }) => {
    switch (admin.environment().state.season) {
      case "spring":
        return +0.5;
      case "winter":
        return -0.75;
      case "autumn":
      case "summer":
        return 0;
    }
  },
  "weather.severity-ratio": ({ admin }) => {
    switch (admin.environment().state.weather) {
      case "warm":
        return +0.15;
      case "cold":
        return -0.15;
      case "neutral":
        return 0;
    }
  },
  "weather.ratio": strictSum(
    effect("weather.season-ratio"),
    effect("weather.severity-ratio"),
  ),

  // Jobs
  "jobs.woodcutter.wood.base": withHappiness(constant(0.018)),
  "jobs.woodcutter.wood": strictProd(
    effect("jobs.woodcutter.wood.base"),
    workers("woodcutter"),
  ),
  "jobs.scholar.science.base": withHappiness(constant(0.035)),
  "jobs.scholar.science": strictProd(
    effect("jobs.scholar.science.base"),
    workers("scholar"),
  ),
  "jobs.farmer.catnip.base": withHappiness(constant(1)),
  "jobs.farmer.catnip": strictProd(
    effect("jobs.farmer.catnip.base"),
    workers("farmer"),
  ),
  "jobs.hunter.catpower.base": withHappiness(constant(0.06)),
  "jobs.hunter.catpower": strictProd(
    effect("jobs.hunter.catpower.base"),
    workers("hunter"),
  ),
  "jobs.miner.minerals.base": withHappiness(constant(0.05)),
  "jobs.miner.minerals": strictProd(
    effect("jobs.miner.minerals.base"),
    workers("miner"),
  ),
};

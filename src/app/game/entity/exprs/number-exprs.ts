import {
  BuildingId,
  JobId,
  NumberEffectId,
  ResourceId,
} from "@/app/interfaces";
import { reduce } from "@/app/utils/collections";

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

const fallback = (check: NumberExpr, fallback: NumberExpr) => (ctx: Ctx) => {
  const checked = unwrap(check, ctx);
  return checked === undefined ? unwrap(fallback, ctx) : checked;
};

const ifdef = (check: NumberExpr, result: NumberExpr) => (ctx: Ctx) => {
  const checked = unwrap(check, ctx);
  if (checked !== undefined) return unwrap(result, ctx);
  else return undefined;
};

// Returns undefined iff all provided exprs unwrap to undefined.
// Otherwise, returns the sum of the valued exprs.
const looseSum =
  (...exprs: NumberExpr[]) =>
  (ctx: Ctx) =>
    reduce(
      exprs,
      (m) => unwrap(m, ctx),
      (acc, value) => {
        // always try to pick a valued expr
        if (acc === undefined) return value;
        else if (value === undefined) return acc;
        else return acc + value;
      },
      0,
    );

// Returns defined iff all provided exprs unwrap to defined.
// Otherwise, returns undefined.
const strictSum =
  (...exprs: NumberExpr[]) =>
  (ctx: Ctx) =>
    reduce(
      exprs,
      (m) => unwrap(m, ctx),
      (acc, value) => {
        // always try to pick a valued expr
        if (acc === undefined || value === undefined) return undefined;
        else return acc + value;
      },
      0,
    );

// Returns defined iff all provided exprs unwrap to defined.
// Otherwise, returns undefined.
const strictProd =
  (...exprs: NumberExpr[]) =>
  (ctx: Ctx) =>
    reduce(
      exprs,
      (m) => unwrap(m, ctx),
      (acc, value) => {
        // propagate any undefined expr we encounter
        if (acc === undefined || value === undefined) return undefined;
        else return acc * value;
      },
      1,
    );

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
  // Limits and other stuff
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
  "minerals.ratio": effect("mine.minerals-ratio"),

  "kittens.limit": effect("hut.kittens-limit"),
  "science.limit": effect("library.science-limit"),
  "science.ratio": effect("library.science-ratio"),

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
    fallback(effect("minerals.ratio"), constant(0)),
  ),

  // Science
  "science.delta": effect("science.production"),
  "science.production": ratio(
    effect("jobs.scholar.science"),
    fallback(effect("science.ratio"), constant(0)),
  ),
  "astronomy.rare-event.reward.base": constant(25),
  "astronomy.rare-event.reward": ratio(
    effect("astronomy.rare-event.reward.base"),
    fallback(effect("science.ratio"), constant(0)),
  ),

  // Catnip fields
  "catnip-field.catnip.base": constant(0.125),
  "catnip-field.catnip": strictProd(
    effect("catnip-field.catnip.base"),
    fallback(building("catnip-field"), constant(0)),
  ),

  // Huts
  "hut.kittens-limit.base": constant(2),
  "hut.kittens-limit": strictProd(
    effect("hut.kittens-limit.base"),
    fallback(building("hut"), constant(0)),
  ),

  // Libraries
  "library.science-limit.base": constant(250),
  "library.science-limit": strictProd(
    effect("library.science-limit.base"),
    fallback(building("library"), constant(0)),
  ),
  "library.science-ratio.base": constant(0.1),
  "library.science-ratio": strictProd(
    effect("library.science-ratio.base"),
    fallback(building("library"), constant(0)),
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
  "barn.minerals-limit.base": ifdef(resource("minerals"), constant(250)),
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
  "population.catnip-demand.base": constant(0.85),
  "population.catnip-demand": strictProd(
    effect("population.catnip-demand.base"),
    fallback(resource("kittens"), constant(0)),
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
  "jobs.woodcutter.wood.base": constant(0.018),
  "jobs.woodcutter.wood": strictProd(
    effect("jobs.woodcutter.wood.base"),
    workers("woodcutter"),
  ),
  "jobs.scholar.science.base": constant(0.035),
  "jobs.scholar.science": strictProd(
    effect("jobs.scholar.science.base"),
    workers("scholar"),
  ),
  "jobs.farmer.catnip.base": constant(1),
  "jobs.farmer.catnip": strictProd(
    effect("jobs.farmer.catnip.base"),
    workers("farmer"),
  ),
  "jobs.miner.minerals.base": constant(0.05),
  "jobs.miner.minerals": strictProd(
    effect("jobs.miner.minerals.base"),
    workers("miner"),
  ),
};

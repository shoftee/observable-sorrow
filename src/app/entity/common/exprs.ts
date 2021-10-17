import { BuildingId, EffectId } from "@/_interfaces";
import { asEnumerable } from "@/_utils/enumerable";

import { EntityAdmin } from "..";

export type Expr = number | ((context: ExprContext) => number);

export type ExprContext = {
  admin: EntityAdmin;
  val: (id: EffectId) => number;
};

const level = (id: BuildingId) => (ctx: ExprContext) =>
  ctx.admin.building(id).state.level;

const effect = (id: EffectId) => (ctx: ExprContext) => ctx.val(id);

const unwrap = (expr: Expr, ctx: ExprContext): number =>
  typeof expr === "function" ? expr(ctx) : expr;

const sum =
  (...exprs: Expr[]) =>
  (ctx: ExprContext) =>
    asEnumerable(exprs).reduce(0, (acc, expr) => acc + unwrap(expr, ctx));

const subtract = (lhs: Expr, rhs: Expr) => (ctx: ExprContext) =>
  unwrap(lhs, ctx) - unwrap(rhs, ctx);

const prod =
  (...exprs: Expr[]) =>
  (ctx: ExprContext) =>
    asEnumerable(exprs).reduce(1, (acc, expr) => acc * unwrap(expr, ctx));

const ratio = (base: Expr, ratio: Expr) => (ctx: ExprContext) =>
  unwrap(base, ctx) * (1 + unwrap(ratio, ctx));

export const Exprs: Record<EffectId, Expr> = {
  // limits
  "catnip.limit.base": 5000,
  "catnip.limit": effect("catnip.limit.base"),

  "wood.limit.base": 200,
  "wood.limit": effect("wood.limit.base"),

  "kittens.limit": effect("hut.kittens"),
  "catpower.limit": effect("hut.catpower"),

  // Wood
  "wood.delta": effect("wood.production"),
  "wood.production": sum(effect("jobs.woodcutter.wood")),

  // Catnip
  "catnip.delta": subtract(
    effect("catnip.production"),
    effect("population.catnip.demand"),
  ),
  "catnip.production": ratio(
    effect("catnip-field.catnip"),
    effect("catnip-field.weather"),
  ),

  // Catnip fields
  "catnip-field.catnip.base": 0.125,
  "catnip-field.catnip": prod(
    effect("catnip-field.catnip.base"),
    level("catnip-field"),
  ),
  "catnip-field.weather": sum(
    effect("weather.modifier.season"),
    effect("weather.modifier.severity"),
  ),

  // Weather
  "weather.modifier.season": ({ admin }) => {
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

  "weather.modifier.severity": ({ admin }) => {
    switch (admin.environment().state.weatherId) {
      case "warm":
        return +0.15;
      case "cold":
        return -0.15;
      case "neutral":
        return 0;
    }
  },

  // hut kitten cap
  "hut.kittens.base": 2,
  "hut.kittens": prod(effect("hut.kittens.base"), level("hut")),

  // hut catpower cap
  "hut.catpower.base": 75,
  "hut.catpower": prod(effect("hut.catpower.base"), level("hut")),

  // population
  "population.catnip.demand.base": 0.85,
  "population.catnip.demand": prod(
    effect("population.catnip.demand.base"),
    ({ admin }) => admin.pops().size,
  ),

  // jobs
  "jobs.woodcutter.wood.base": 0.018,
  "jobs.woodcutter.wood": prod(
    effect("jobs.woodcutter.wood.base"),
    ({ admin }) => admin.pops().withJob("woodcutter").count(),
  ),
};

import { BuildingId, EffectId, ResourceId } from "@/_interfaces";
import { asEnumerable } from "@/_utils/enumerable";

import { EntityAdmin } from "..";

export type Expr = number | ((context: ExprContext) => number);

export type ExprContext = {
  admin: EntityAdmin;
  val: (id: EffectId) => number;
};

const level = (id: BuildingId) => (ctx: ExprContext) =>
  ctx.admin.building(id).state.level;

const res = (id: ResourceId) => (ctx: ExprContext) =>
  ctx.admin.resource(id).state.amount;

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

  // extras....
  "wood.production": 0,
  "catpower.production": 0,

  // Catnip delta
  "catnip.delta": subtract(
    effect("catnip.production"),
    effect("population.demand"),
  ),
  "catnip.production": effect("catnip-field.catnip"),

  // catnip fields
  "catnip-field.catnip.base": ratio(0.125, effect("catnip-field.weather")),
  "catnip-field.catnip": prod(
    effect("catnip-field.catnip.base"),
    level("catnip-field"),
  ),
  "catnip-field.weather": sum(
    effect("weather.modifier.season"),
    effect("weather.modifier.severity"),
  ),

  // weather
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
  "population.growth": 0.01,
  "population.starvation": 0.2,
  "population.demand": prod(effect("population.demand.base"), res("kittens")),
  "population.demand.base": 0.85,
};

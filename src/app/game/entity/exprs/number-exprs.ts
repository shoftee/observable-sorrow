import { BuildingId, JobId, NumberEffectId } from "@/app/interfaces";
import { asEnumerable } from "@/app/utils/enumerable";

import { effect, unwrap, Expr, ExprContext } from "./common";

export type NumberExpr = Expr<number, NumberEffectId>;
type Ctx = ExprContext<number, NumberEffectId>;

const level = (id: BuildingId) => (ctx: Ctx) =>
  ctx.admin.building(id).state.level;

const workers = (id: JobId) => (ctx: Ctx) =>
  ctx.admin.pops().withJob(id).count();

const sum =
  (...exprs: NumberExpr[]) =>
  (ctx: Ctx) =>
    asEnumerable(exprs).reduce(0, (acc, expr) => acc + unwrap(expr, ctx));

const subtract = (lhs: NumberExpr, rhs: NumberExpr) => (ctx: Ctx) =>
  unwrap(lhs, ctx) - unwrap(rhs, ctx);

const prod =
  (...exprs: NumberExpr[]) =>
  (ctx: Ctx) =>
    asEnumerable(exprs).reduce(1, (acc, expr) => acc * unwrap(expr, ctx));

const ratio = (base: NumberExpr, ratio: NumberExpr) => (ctx: Ctx) =>
  unwrap(base, ctx) * (1 + unwrap(ratio, ctx));

export const NumberExprs: Record<NumberEffectId, NumberExpr> = {
  // Limits and other stuff
  "catnip.limit.base": 5000,
  "catnip.limit": effect("catnip.limit.base"),

  "wood.limit.base": 200,
  "wood.limit": effect("wood.limit.base"),

  "kittens.limit": effect("hut.kittens-limit"),
  "catpower.limit": effect("hut.catpower-limit"),
  "science.limit": effect("library.science-limit"),
  "science.ratio": effect("library.science-ratio"),
  "culture.limit": effect("library.culture-limit"),

  // Wood
  "wood.delta": effect("wood.production"),
  "wood.production": sum(effect("jobs.woodcutter.wood")),

  // Catnip
  "catnip.delta": subtract(
    effect("catnip.production"),
    effect("population.catnip-demand"),
  ),
  "catnip.production": sum(
    ratio(effect("catnip-field.catnip"), effect("catnip-field.weather")),
    effect("jobs.farmer.catnip"),
  ),

  // Science
  "science.delta": effect("science.production"),
  "science.production": ratio(
    effect("jobs.scholar.science"),
    effect("science.ratio"),
  ),

  // Catnip fields
  "catnip-field.catnip.base": 0.125,
  "catnip-field.catnip": prod(
    effect("catnip-field.catnip.base"),
    level("catnip-field"),
  ),
  "catnip-field.weather": sum(
    effect("weather.season-ratio"),
    effect("weather.severity-ratio"),
  ),

  // Huts
  "hut.kittens-limit.base": 2,
  "hut.kittens-limit": prod(effect("hut.kittens-limit.base"), level("hut")),
  "hut.catpower-limit.base": 75,
  "hut.catpower-limit": prod(effect("hut.catpower-limit.base"), level("hut")),

  // Libraries
  "library.science-limit.base": 250,
  "library.science-limit": prod(
    effect("library.science-limit.base"),
    level("library"),
  ),
  "library.science-ratio.base": 0.1,
  "library.science-ratio": prod(
    effect("library.science-ratio.base"),
    level("library"),
  ),
  "library.culture-limit.base": 10,
  "library.culture-limit": prod(
    effect("library.culture-limit.base"),
    level("library"),
  ),

  // Population
  "population.catnip-demand.base": 0.85,
  "population.catnip-demand": prod(
    effect("population.catnip-demand.base"),
    ({ admin }) => admin.pops().size,
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

  // Jobs
  "jobs.woodcutter.wood.base": 0.018,
  "jobs.woodcutter.wood": prod(
    effect("jobs.woodcutter.wood.base"),
    workers("woodcutter"),
  ),
  "jobs.scholar.science.base": 0.035,
  "jobs.scholar.science": prod(
    effect("jobs.scholar.science.base"),
    workers("scholar"),
  ),
  "jobs.farmer.catnip.base": 1,
  "jobs.farmer.catnip": prod(
    effect("jobs.farmer.catnip.base"),
    workers("farmer"),
  ),
};

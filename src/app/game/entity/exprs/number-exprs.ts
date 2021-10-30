import {
  BuildingId,
  JobId,
  NumberEffectId,
  ResourceId,
} from "@/app/interfaces";
import { EffectState } from "@/app/state";
import { reduce } from "@/app/utils/collections";

import { effect, unwrap, Expr, ExprContext } from "./common";

export type NumberExpr = Expr<EffectState<number>, NumberEffectId>;
type Ctx = ExprContext<EffectState<number>, NumberEffectId>;

const building = (id: BuildingId) => (ctx: Ctx) => {
  const building = ctx.admin.building(id).state;
  return { value: building.unlocked ? building.level : undefined };
};

const resource = (id: ResourceId) => (ctx: Ctx) => {
  const resource = ctx.admin.resource(id).state;
  return { value: resource.unlocked ? resource.amount : undefined };
};

const workers = (id: JobId) => (ctx: Ctx) => ({
  value: ctx.admin.pops().withJob(id).count(),
});

const lockedResourceConstant = (c: number, id: ResourceId) => (ctx: Ctx) => ({
  value: ctx.admin.resource(id).state.unlocked ? c : undefined,
});

const fallback = (check: NumberExpr, fallback: NumberExpr) => (ctx: Ctx) => {
  const checked = unwrap(check, ctx);
  return checked.value === undefined ? unwrap(fallback, ctx) : checked;
};

const constant = (c: number) => (_: Ctx) => ({ value: c });

const sum =
  (...exprs: NumberExpr[]) =>
  (ctx: Ctx) => ({
    value: reduce(
      exprs,
      (m) => unwrap(m, ctx).value,
      (acc, value) =>
        acc === undefined || value === undefined ? undefined : acc + value,
      0,
    ),
  });

const subtract = (lhs: NumberExpr, rhs: NumberExpr) => (ctx: Ctx) => {
  const lhsVal = unwrap(lhs, ctx).value;
  const rhsVal = unwrap(rhs, ctx).value;
  return {
    value:
      lhsVal === undefined || rhsVal === undefined
        ? undefined
        : lhsVal - rhsVal,
  };
};

const prod =
  (...exprs: NumberExpr[]) =>
  (ctx: Ctx) => ({
    value: reduce(
      exprs,
      (m) => unwrap(m, ctx).value,
      (acc, value) =>
        acc === undefined || value === undefined ? undefined : acc * value,
      1,
    ),
  });

const ratio = (base: NumberExpr, ratio: NumberExpr) => (ctx: Ctx) => {
  const baseVal = unwrap(base, ctx).value;
  const ratioVal = unwrap(ratio, ctx).value;
  return {
    value:
      baseVal === undefined || ratioVal === undefined
        ? undefined
        : baseVal * (1 + ratioVal),
  };
};

export const NumberExprs: Record<NumberEffectId, NumberExpr> = {
  // Limits and other stuff
  "catnip.limit.base": constant(5000),
  "catnip.limit": effect("catnip.limit.base"),

  "wood.limit.base": constant(200),
  "wood.limit": effect("wood.limit.base"),

  "kittens.limit": effect("hut.kittens-limit"),
  "catpower.limit": effect("hut.catpower-limit"),
  "science.limit": effect("library.science-limit"),
  "science.ratio": effect("library.science-ratio"),
  "culture.limit": effect("library.culture-limit"),

  // Catnip
  "catnip.delta": subtract(
    effect("catnip.production"),
    effect("population.catnip-demand"),
  ),
  "catnip.production": sum(
    ratio(effect("catnip-field.catnip"), effect("weather.ratio")),
    effect("jobs.farmer.catnip"),
  ),

  // Wood
  "wood.delta": effect("wood.production"),
  "wood.production": sum(effect("jobs.woodcutter.wood")),

  // Science
  "science.delta": effect("science.production"),
  "science.production": ratio(
    effect("jobs.scholar.science"),
    effect("science.ratio"),
  ),
  "astronomy.rare-event.reward.base": constant(25),
  "astronomy.rare-event.reward": ratio(
    effect("astronomy.rare-event.reward.base"),
    effect("science.ratio"),
  ),

  // Culture
  "culture.delta": constant(0),

  // Catnip fields
  "catnip-field.catnip.base": constant(0.125),
  "catnip-field.catnip": prod(
    effect("catnip-field.catnip.base"),
    building("catnip-field"),
  ),

  // Huts
  "hut.kittens-limit.base": constant(2),
  "hut.kittens-limit": prod(effect("hut.kittens-limit.base"), building("hut")),
  "hut.catpower-limit.base": lockedResourceConstant(75, "catpower"),
  "hut.catpower-limit": prod(
    effect("hut.catpower-limit.base"),
    building("hut"),
  ),

  // Libraries
  "library.science-limit.base": constant(250),
  "library.science-limit": prod(
    effect("library.science-limit.base"),
    building("library"),
  ),
  "library.science-ratio.base": constant(0.1),
  "library.science-ratio": prod(
    effect("library.science-ratio.base"),
    building("library"),
  ),
  "library.culture-limit.base": lockedResourceConstant(10, "culture"),
  "library.culture-limit": prod(
    effect("library.culture-limit.base"),
    building("library"),
  ),

  // Population
  "population.catnip-demand.base": constant(0.85),
  "population.catnip-demand": prod(
    effect("population.catnip-demand.base"),
    fallback(resource("kittens"), constant(0)),
  ),

  // Weather
  "weather.season-ratio": ({ admin }) => {
    switch (admin.environment().state.season) {
      case "spring":
        return { value: +0.5 };
      case "winter":
        return { value: -0.75 };
      case "autumn":
      case "summer":
        return { value: 0 };
    }
  },
  "weather.severity-ratio": ({ admin }) => {
    switch (admin.environment().state.weather) {
      case "warm":
        return { value: +0.15 };
      case "cold":
        return { value: -0.15 };
      case "neutral":
        return { value: 0 };
    }
  },
  "weather.ratio": sum(
    effect("weather.season-ratio"),
    effect("weather.severity-ratio"),
  ),

  // Jobs
  "jobs.woodcutter.wood.base": constant(0.018),
  "jobs.woodcutter.wood": prod(
    effect("jobs.woodcutter.wood.base"),
    workers("woodcutter"),
  ),
  "jobs.scholar.science.base": constant(0.035),
  "jobs.scholar.science": prod(
    effect("jobs.scholar.science.base"),
    workers("scholar"),
  ),
  "jobs.farmer.catnip.base": constant(1),
  "jobs.farmer.catnip": prod(
    effect("jobs.farmer.catnip.base"),
    workers("farmer"),
  ),
};

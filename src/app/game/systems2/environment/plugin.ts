import { TimeConstants } from "@/app/state";

import { PluginApp, EcsPlugin } from "@/app/ecs";
import {
  Commands,
  Query,
  Read,
  Has,
  DiffMut,
  Value,
  Fresh,
  Single,
  Entity,
  First,
} from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { DeltaExtractor } from "../core";
import { EffectValueResolver } from "../effects/ecs";
import { NumberValue, SeasonEffect, WeatherEffect } from "../effects/types";
import { Timer } from "../time/types";
import { Prng } from "../types/common";

import {
  getWeatherSeasonRatio,
  getWeatherSeverityRatio,
  nextSeason,
  WeatherChoices,
} from "./functions";
import * as E from "./types";
import { PerTickSystem } from "../time/ecs";

const Setup = System(Commands())((cmds) => {
  cmds.spawn(new E.DayTimer(), new Timer(2000));
  cmds.spawn(
    new E.Day(),
    new E.Season(),
    new E.Year(),
    new E.Weather(),
    new E.Labels(),
    new Prng(),
  );
});

const AdvanceCalendar = PerTickSystem(Query(Read(Timer), Has(E.DayTimer)))(
  Single(
    DiffMut(E.Day),
    DiffMut(E.Season),
    DiffMut(E.Year),
    DiffMut(E.Weather),
    Read(Prng),
  ),
)(([day, season, year, weather, prng]) => {
  const newDay = day.value + 1;
  if (newDay < TimeConstants.DaysPerSeason) {
    // new day
    day.value = newDay;
  } else {
    // new season
    day.value = 0;
    season.value = nextSeason(season.value);
    if (season.value === "spring") {
      // new year
      year.value++;
    }

    if (year.value > 3) {
      weather.value = prng.choice(WeatherChoices);
    }
  }
});

const HandleSeasonChanged = System(
  First(Value(E.Season), Fresh(E.Season)),
  Single(Entity(), DiffMut(NumberValue), Has(SeasonEffect)),
  EffectValueResolver(),
)(([season], effect, resolver) => {
  if (season) {
    const [id] = season;
    const [entity, value] = effect;

    value.value = getWeatherSeasonRatio(id);
    resolver.resolveByEntities([entity]);
  }
});

const HandleWeatherChanged = System(
  First(Value(E.Weather), DiffMut(E.Labels), Fresh(E.Weather)),
  Single(Entity(), DiffMut(NumberValue), Has(WeatherEffect)),
  EffectValueResolver(),
)(([weather], effect, resolver) => {
  if (weather) {
    const [id, labels] = weather;
    const [entity, value] = effect;

    value.value = getWeatherSeverityRatio(id);
    resolver.resolveByEntities([entity]);

    // TODO: Calendar tech
    labels.date =
      id === "neutral" ? "calendar.full.no-weather" : "calendar.full.weather";
  }
});

const CalendarExtractor = DeltaExtractor()((schema) => schema.calendar);

const Extractors = [
  CalendarExtractor(E.Day, (calendar, { value: day }) => {
    calendar.day = day;
  }),
  CalendarExtractor(E.Season, (calendar, { value: season }) => {
    calendar.season = season;
  }),
  CalendarExtractor(E.Year, (calendar, { value: year }) => {
    calendar.year = year;
  }),
  CalendarExtractor(E.Weather, (calendar, { value: weather }) => {
    calendar.weather = weather;
  }),
  CalendarExtractor(E.Labels, (calendar, { date, epoch }) => {
    calendar.labels.date = date;
    calendar.labels.epoch = epoch;
  }),
];

export class EnvironmentPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .addStartupSystem(Setup)
      .addSystems([AdvanceCalendar, HandleSeasonChanged, HandleWeatherChanged])
      .addSystems(Extractors, { stage: "last-start" });
  }
}

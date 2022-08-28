import { single, take } from "@/app/utils/collections";

import { TimeConstants } from "@/app/state";

import { PluginApp, EcsPlugin } from "@/app/ecs";
import {
  Commands,
  Query,
  Read,
  Every,
  DiffMut,
  Value,
  AddedOrChanged,
} from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { DeltaExtractor } from "../core/renderer";

import { RecalculateByList } from "../effects/calculation";
import { NumberValue, SeasonEffect, WeatherEffect } from "../effects/types";
import { Timer } from "../types";
import { Prng } from "../types/common";

import {
  getWeatherSeasonRatio,
  getWeatherSeverityRatio,
  nextSeason,
  nextWeather,
} from "./functions";
import * as E from "./types";

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

const AdvanceCalendar = System(
  Query(Read(Timer)).filter(Every(E.DayTimer)),
  Query(
    DiffMut(E.Day),
    DiffMut(E.Season),
    DiffMut(E.Year),
    DiffMut(E.Weather),
    Read(Prng),
  ),
)((timerQuery, calendarQuery) => {
  const [days] = single(timerQuery);
  const [day, season, year, weather, prng] = single(calendarQuery);
  if (days.isNewTick) {
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
        weather.value = nextWeather(() => prng.next());
      }
    }
  }
});

const UpdateSeasonEffect = System(
  Query(Value(E.Season)).filter(AddedOrChanged(E.Season)),
  Query(DiffMut(NumberValue)).filter(Every(SeasonEffect)),
)((seasonQuery, numberQuery) => {
  for (const [season] of take(seasonQuery, 1)) {
    const [effect] = single(numberQuery);
    effect.value = getWeatherSeasonRatio(season);
  }
});

const HandleWeatherChanged = System(
  Query(Value(E.Weather), DiffMut(E.Labels)).filter(AddedOrChanged(E.Weather)),
  Query(DiffMut(NumberValue)).filter(Every(WeatherEffect)),
)((weatherQuery, numberQuery) => {
  for (const [weather, labels] of take(weatherQuery, 1)) {
    const [effect] = single(numberQuery);
    effect.value = getWeatherSeverityRatio(weather);

    // TODO: Calendar tech
    labels.date =
      weather === "neutral"
        ? "calendar.full.no-weather"
        : "calendar.full.weather";
  }
});

const UpdateEffectTargets = RecalculateByList(
  "weather.season-ratio",
  "weather.severity-ratio",
);

const CalendarRecorder = DeltaExtractor()((schema) => schema.calendar);

const DeltaRecorders = [
  CalendarRecorder(E.Day, (calendar, { value: day }) => {
    calendar.day = day;
  }),
  CalendarRecorder(E.Season, (calendar, { value: season }) => {
    calendar.season = season;
  }),
  CalendarRecorder(E.Year, (calendar, { value: year }) => {
    calendar.year = year;
  }),
  CalendarRecorder(E.Weather, (calendar, { value: weather }) => {
    calendar.weather = weather;
  }),
  CalendarRecorder(E.Labels, (calendar, { date, epoch }) => {
    calendar.labels.date = date;
    calendar.labels.epoch = epoch;
  }),
];

export class EnvironmentPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .addStartupSystem(Setup)
      .addSystems([
        AdvanceCalendar,
        UpdateSeasonEffect,
        HandleWeatherChanged,
        UpdateEffectTargets,
      ])
      .addSystems(DeltaRecorders, { stage: "last-start" });
  }
}

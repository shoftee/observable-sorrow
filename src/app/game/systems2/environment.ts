import { single } from "@/app/utils/collections";

import { SeasonId } from "@/app/interfaces";
import { TimeConstants } from "@/app/state";

import { PluginApp, EcsPlugin } from "@/app/ecs";
import { Commands, Query, Read, Every, Mut } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { DeltaExtractor } from "./core/renderer";

import { Timer } from "./types";
import * as E from "./types/environment";

const Setup = System(Commands())((cmds) => {
  cmds.spawn(new E.DayTimer(), new Timer(2000));
  cmds.spawn(
    new E.Day(),
    new E.Season(),
    new E.Year(),
    new E.Weather(),
    new E.Labels(),
  );
});

const NextSeasonMap: Record<SeasonId, SeasonId> = {
  ["spring"]: "summer",
  ["summer"]: "autumn",
  ["autumn"]: "winter",
  ["winter"]: "spring",
};

const AdvanceCalendar = System(
  Query(Read(Timer)).filter(Every(E.DayTimer)),
  Query(Mut(E.Day), Mut(E.Season), Mut(E.Year)),
)((timerQuery, calendarQuery) => {
  const [days] = single(timerQuery);
  const [day, season, year] = single(calendarQuery);
  if (days.isNewTick) {
    const newDay = day.value + 1;
    if (newDay < TimeConstants.DaysPerSeason) {
      // new day
      day.value = newDay;
    } else {
      // new season
      day.value = 0;
      const newSeason = NextSeasonMap[season.value];
      season.value = newSeason;

      if (newSeason === "spring") {
        // new year
        year.value++;
      }
    }
  }
});

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
  CalendarRecorder(E.Labels, (calendar, { dateLabel, epochLabel }) => {
    calendar.dateLabel = dateLabel;
    calendar.epochLabel = epochLabel;
  }),
];

export class EnvironmentPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .addStartupSystem(Setup)
      .addSystem(AdvanceCalendar)
      .addSystems(DeltaRecorders, { stage: "last-start" });
  }
}

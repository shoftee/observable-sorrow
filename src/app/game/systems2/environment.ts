import { SeasonId } from "@/app/interfaces";
import { TimeConstants } from "@/app/state";

import { PluginApp, EcsPlugin } from "@/app/ecs";
import { Commands, DiffMut, Query, Read, With } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { Timer, DeltaRecorder } from "./types";
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
  spring: "summer",
  summer: "autumn",
  autumn: "winter",
  winter: "spring",
};

const AdvanceCalendar = System(
  Query(Read(Timer)).filter(With(E.DayTimer)),
  Query(DiffMut(E.Day), DiffMut(E.Season), DiffMut(E.Year)),
)((timerQuery, calendarQuery) => {
  const [days] = timerQuery.single();
  const [day, season, year] = calendarQuery.single();
  if (days.isNewTick) {
    day.value += 1;
    if (day.value >= TimeConstants.DaysPerSeason) {
      day.value = 0;
      season.value = NextSeasonMap[season.value];
      if (season.value === "spring") {
        year.value++;
      }
    }
  }
});

const DeltaRecorders = [
  DeltaRecorder(E.Day)((root, { value: day }) => {
    root.calendar.day = day;
  }),
  DeltaRecorder(E.Season)((root, { value: season }) => {
    root.calendar.season = season;
  }),
  DeltaRecorder(E.Year)((root, { value: year }) => {
    root.calendar.year = year;
  }),
  DeltaRecorder(E.Weather)((root, { value: weather }) => {
    root.calendar.weather = weather;
  }),
  DeltaRecorder(E.Labels)((root, { dateLabel, epochLabel }) => {
    root.calendar.dateLabel = dateLabel;
    root.calendar.epochLabel = epochLabel;
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

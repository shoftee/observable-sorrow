import { SeasonId } from "@/app/interfaces";
import { TimeConstants } from "@/app/state";

import { PluginApp, EcsPlugin } from "@/app/ecs";
import { Commands, Mut, Query, Read, With } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { Timer, DeltaRecorder } from "./types";
import * as E from "./types/environment";

const Setup = System(Commands())((cmds) => {
  cmds.spawn(new E.DayTimer(), new Timer(2000));
  cmds.spawn(new E.Environment(), new E.Calendar());
});

const AdvanceCalendar = System(
  Query(Read(Timer)).filter(With(E.DayTimer)),
  Query(Mut(E.Calendar)).filter(With(E.Environment)),
)((timerQuery, calendarQuery) => {
  const [days] = timerQuery.single();
  const [calendar] = calendarQuery.single();
  if (days.isNewTick) {
    let currentDay = calendar.day;
    currentDay += 1;
    if (currentDay >= TimeConstants.DaysPerSeason) {
      currentDay = 0;
      const nextSeason = calculateNextSeason(calendar.season);
      calendar.season = nextSeason;
      if (nextSeason === "spring") {
        calendar.year++;
      }

      // TODO: weather
    }

    calendar.day = currentDay;
  }
});

const TrackCalendar = DeltaRecorder(
  E.Calendar,
  Read(E.Environment),
)((root, calendar) => {
  root.calendar = calendar;
});

export class EnvironmentPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .addStartupSystem(Setup)
      .addSystem(AdvanceCalendar)
      .addSystem(TrackCalendar, { stage: "last-start" });
  }
}

// utility functions
function calculateNextSeason(current: SeasonId): SeasonId {
  switch (current) {
    case "spring":
      return "summer";
    case "summer":
      return "autumn";
    case "autumn":
      return "winter";
    case "winter":
      return "spring";
  }
}

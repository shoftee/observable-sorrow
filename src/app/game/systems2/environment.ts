import { SeasonId } from "@/app/interfaces";
import { TimeConstants } from "@/app/state";

import { PluginApp, EcsPlugin } from "@/app/ecs";
import { Commands, Mut, Query, Read, With } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import {
  Timer,
  Calendar,
  DayTimer,
  Environment,
  ChangeTrackingSystem,
} from "./types";

const Setup = System(Commands())((cmds) => {
  cmds.spawn(new DayTimer(), new Timer(2000));
  cmds.spawn(new Environment(), new Calendar());
});

const AdvanceCalendar = System(
  Query(Read(Timer)).filter(With(DayTimer)),
  Query(Mut(Calendar)).filter(With(Environment)),
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

const TrackCalendar = ChangeTrackingSystem(
  Environment,
  Calendar,
  (root, _, calendar) => {
    root.calendar = calendar;
  },
);

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

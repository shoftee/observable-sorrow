import { SeasonId } from "@/app/interfaces";
import { TimeConstants } from "@/app/state";

import { PluginApp, EcsPlugin } from "@/app/ecs";
import {
  ChangeTrackers,
  Commands,
  Mut,
  Query,
  Read,
  Res,
  With,
} from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { DeltaBuffer, Timer, Calendar, DayTimer, Environment } from "./types";

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

const TrackChanges = System(
  Res(DeltaBuffer),
  Query(ChangeTrackers(Calendar)).filter(With(Environment)),
)((buffer, query) => {
  const [tracker] = query.single();
  if (tracker.isAdded()) {
    buffer.components.setAdded((root) => (root.calendar = tracker.value()));
  } else if (tracker.isChanged()) {
    buffer.components.setChanged((root) => (root.calendar = tracker.value()));
  }
});

export class EnvironmentPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .addStartupSystem(Setup)
      .addSystem(AdvanceCalendar)
      .addSystem(TrackChanges, { stage: "main-end" });
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

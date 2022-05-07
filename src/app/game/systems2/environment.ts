import { SeasonId } from "@/app/interfaces";
import { TimeConstants } from "@/app/state";

import { App, Plugin } from "@/app/ecs";
import { Commands, Query, Res, System } from "@/app/ecs/system";
import { ChangeTrackers, Mut, Read, With } from "@/app/ecs/query";

import { Timer } from "@/app/ecs/plugins/time";

import { DeltaBuffer } from "./types";
import { Calendar, EnvironmentMarker } from "./types/environment";

export class DayTimer extends Timer {
  constructor() {
    super(2000);
  }
}

const startup = System(Commands())((cmds) => {
  cmds.spawn(new EnvironmentMarker(), new DayTimer(), new Calendar());
});

const advanceDaysQuery = Query(Read(DayTimer), Mut(Calendar)).filter(
  With(EnvironmentMarker),
);
const AdvanceDays = System(advanceDaysQuery)((query) => {
  const [days, calendar] = query.single();
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
  Query(ChangeTrackers(Calendar)).filter(With(EnvironmentMarker)),
)((buffer, query) => {
  const [tracker] = query.single();
  if (tracker.isAdded()) {
    buffer.components.setAdded({ calendar: tracker.value() });
  } else if (tracker.isChanged()) {
    buffer.components.setChanged({ calendar: tracker.value() });
  }
});

export class EnvironmentPlugin extends Plugin {
  add(app: App): void {
    app
      .addStartupSystem(startup)
      .addSystem(AdvanceDays)
      .addSystem(TrackChanges, "postUpdate");
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

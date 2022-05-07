import { App, EcsComponent, Plugin } from "@/app/ecs";
import { Timer } from "@/app/ecs/time-plugin";
import { Commands, Query, System } from "@/app/ecs/system";

import { SeasonId } from "@/app/interfaces";
import { Mut, Read, With } from "@/app/ecs/query";
import { TimeConstants } from "@/app/state";

import Markers from "./_markers";

const Marker = Markers.Environment;

// Timers
export class DayTimer extends Timer {
  constructor() {
    super(2000);
  }
}

class Calendar extends EcsComponent {
  day = 0; // integer
  season: SeasonId = "spring";
  year = 0; // integer
}

const Startup = System(Commands())((cmds) => {
  cmds.spawn(new Marker(), new DayTimer(), new Calendar());
});

const advanceDaysQuery = Query(Read(DayTimer), Mut(Calendar)).filter(
  With(Marker),
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

export class EnvironmentPlugin extends Plugin {
  add(app: App): void {
    app.addStartupSystem(Startup).addSystem(AdvanceDays);
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

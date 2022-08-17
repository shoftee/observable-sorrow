import { round } from "@/app/utils/mathx";

import { PluginApp, EcsComponent, EcsPlugin } from "@/app/ecs";
import { Commands, Query, Mut, With, Receive, Read } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { ChangeTrackingSystem, TimeOptions, Timer } from "./types";
import * as events from "./types/events";

const TimeMarker = class extends EcsComponent {};

class DeltaTime extends EcsComponent {
  last?: number;
  delta = 0;
}

const Setup = System(Commands())((cmds) => {
  cmds.spawn(new TimeMarker(), new DeltaTime(), new TimeOptions());
});

const HandleOptionsChanged = System(
  Receive(events.TimeOptionsChanged),
  Query(Mut(TimeOptions)).filter(With(TimeMarker)),
)((events, optionsQuery) => {
  const [options] = optionsQuery.single();
  for (const { intent } of events.pull()) {
    switch (intent.id) {
      case "pawse":
        options.paused = true;
        break;
      case "unpawse":
        options.paused = false;
        break;
      case "set-power":
        options.power = intent.power;
        break;
    }
  }
});

const UpdateGameTime = System(
  Query(Mut(DeltaTime), Read(TimeOptions)).filter(With(TimeMarker)),
)((query) => {
  const [time, options] = query.single();

  const now = Date.now();

  // game paused <=> delta is 0
  const speed = options.paused ? 0 : Math.pow(10, options.power);
  // calculate system time delta
  time.delta = (now - (time.last ?? now)) * speed;

  time.last = now;
});

const AdvanceTimers = System(
  Query(Read(DeltaTime)).filter(With(TimeMarker)),
  Query(Mut(Timer)),
)((timeQuery, timerQuery) => {
  const [{ delta }] = timeQuery.single();
  if (delta > 0) {
    for (const [timer] of timerQuery.all()) {
      const last = timer.ticks;

      // calculate delta for the ticker
      timer.delta = delta / timer.period;

      // increment ticks
      timer.ticks = round(timer.ticks + timer.delta, 3);

      // determine if delta pushed us past an integer tick.
      timer.elapsed = Math.floor(timer.ticks) - Math.floor(last);
    }
  } else {
    // no time has elapsed
    for (const [timer] of timerQuery.all()) {
      timer.delta = timer.elapsed = 0;
    }
  }
});

const TrackTime = ChangeTrackingSystem(
  TimeMarker,
  TimeOptions,
  (root, _, options) => {
    root.time = options;
  },
);

export class TimePlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .registerEvent(events.TimeOptionsChanged)
      .addStartupSystem(Setup)
      .addSystems([UpdateGameTime, AdvanceTimers], { stage: "first" })
      .addSystem(HandleOptionsChanged)
      .addSystem(TrackTime, { stage: "last-start" });
  }
}

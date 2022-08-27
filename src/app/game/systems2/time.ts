import { single } from "@/app/utils/collections";
import { round } from "@/app/utils/mathx";

import { PluginApp, EcsComponent, EcsPlugin } from "@/app/ecs";
import { Commands, Query, Mut, Receive, Read, DiffMut } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { DeltaExtractor } from "./core/renderer";
import { TimeOptions, Timer } from "./types";
import * as events from "./types/events";

class DeltaTime extends EcsComponent {
  last?: number;
  delta = 0;
}

const Setup = System(Commands())((cmds) => {
  cmds.spawn(new DeltaTime(), new TimeOptions());
});

const HandleOptionsChanged = System(
  Receive(events.TimeOptionsChanged),
  Query(DiffMut(TimeOptions)),
)((events, optionsQuery) => {
  const [options] = single(optionsQuery);
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

const UpdateGameTime = System(Query(Mut(DeltaTime), Read(TimeOptions)))(
  (query) => {
    const [time, options] = single(query);

    const now = Date.now();

    // game paused <=> delta is 0
    const speed = options.paused ? 0 : Math.pow(10, options.power);
    // calculate system time delta
    time.delta = (now - (time.last ?? now)) * speed;

    time.last = now;
  },
);

const AdvanceTimers = System(
  Query(Read(DeltaTime)),
  Query(DiffMut(Timer)),
)((timeQuery, timers) => {
  const [{ delta }] = single(timeQuery);
  if (delta > 0) {
    for (const [timer] of timers) {
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
    for (const [timer] of timers) {
      timer.delta = timer.elapsed = 0;
    }
  }
});

const TimeRecorder = DeltaExtractor()((schema) => schema.time);

const TrackTime = TimeRecorder(TimeOptions, (time, options) => {
  time.paused = options.paused;
  time.power = options.power;
});

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

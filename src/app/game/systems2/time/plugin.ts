import { single } from "@/app/utils/collections";
import { round } from "@/app/utils/mathx";

import { TimeConstants } from "@/app/state";

import { PluginApp, EcsComponent, EcsPlugin } from "@/app/ecs";
import { Commands, Query, Mut, Receive, Read, DiffMut } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { DeltaExtractor } from "../core";
import * as events from "../types/events";

import { TickTimer, TimeControls, Timer } from "./types";

class DeltaTime extends EcsComponent {
  last?: number;
  delta = 0;
}

const Setup = System(Commands())((cmds) => {
  cmds.spawn(new DeltaTime(), new TimeControls());
  cmds.spawn(new TickTimer(), new Timer(TimeConstants.MillisPerTick));
});

const HandleOptionsChanged = System(
  Receive(events.TimeOptionsChanged),
  Query(DiffMut(TimeControls)),
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

  options.millisPerTick = TimeConstants.MillisPerTick / options.speed;
});

const UpdateGameTime = System(Query(Mut(DeltaTime), Read(TimeControls)))(
  (query) => {
    const [time, options] = single(query);

    const now = Date.now();

    // game paused <=> delta is 0
    const speed = options.paused ? 0 : options.speed;
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

const TimeExtractor = DeltaExtractor()((schema) => schema.time);

const Extractors = [
  TimeExtractor(TimeControls, (time, options) => {
    time.paused = options.paused;
    time.power = options.power;
    time.millisPerTick = options.millisPerTick;
  }),
];

export class TimePlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .registerEvent(events.TimeOptionsChanged)
      .addStartupSystem(Setup)
      .addSystems([UpdateGameTime, AdvanceTimers], { stage: "first" })
      .addSystem(HandleOptionsChanged)
      .addSystems(Extractors, { stage: "last-start" });
  }
}

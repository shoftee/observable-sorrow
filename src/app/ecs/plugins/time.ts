import { round } from "@/app/utils/mathx";

import { App, EcsPlugin } from "../app";
import { Mut, Query, Res } from "../query";
import { System } from "../system";
import { EcsResource, EcsComponent } from "../types";

export class GameTime extends EcsResource {
  last = 0;
  delta = 0;
  speed = 1;
}

export class Timer extends EcsComponent {
  ticks = 0;
  delta = 0;
  elapsed = 0;

  constructor(readonly period: number) {
    super();
  }

  get isNewTick(): boolean {
    return this.elapsed > 0;
  }
}

const UpdateGameTime = System(Res(GameTime))((time) => {
  // calculate system time delta
  const now = Date.now();
  time.delta = (now - time.last) * time.speed;
  time.last = now;
});

const AdvanceTimers = System(
  Res(GameTime),
  Query(Mut(Timer)),
)(({ delta }, timerQuery) => {
  for (const [timer] of timerQuery.all()) {
    const last = timer.ticks;

    // calculate delta for the ticker
    timer.delta = delta / timer.period;

    // increment ticks
    timer.ticks = round(timer.ticks + timer.delta, 3);

    // determine if delta pushed us past an integer tick.
    timer.elapsed = Math.floor(timer.ticks) - Math.floor(last);
  }
});

export class TimePlugin extends EcsPlugin {
  add(app: App): void {
    app
      .insertResource(new GameTime())
      .addSystem(UpdateGameTime, "first")
      .addSystem(AdvanceTimers, "first");
  }
}

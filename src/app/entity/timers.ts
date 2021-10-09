import { Entity } from "@/_ecs";

import { CalendarConstants } from "../constants/calendar";

import { Timer } from ".";

export class TimeEntity extends Entity {
  readonly ticks: Timer;
  readonly days: Timer;

  constructor() {
    super("time");

    this.ticks = new Timer(1);
    this.days = new Timer(CalendarConstants.TicksPerDay);
  }

  *timers(): Iterable<Timer> {
    yield this.ticks;
    yield this.days;
  }
}

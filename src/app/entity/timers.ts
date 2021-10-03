import { SimpleEntity, TimerComponent } from "@/_ecs";

import { CalendarConstants } from "../constants/calendar";

export class TimersEntity extends SimpleEntity {
  readonly ticks: TimerComponent;
  readonly days: TimerComponent;

  constructor() {
    super("timers");

    this.ticks = this.addComponent(new TimerComponent(1));
    this.days = this.addComponent(
      new TimerComponent(CalendarConstants.TicksPerDay),
    );
  }

  update(dt: number): void {
    this.ticks.update(dt);
    this.days.update(dt);
  }
}

import { SimpleEntity } from "../ecs";
import { CalendarConstants } from "../constants/calendar";

import { TimerComponent } from "../ecs/common";
import { EntityAdmin } from "./entity-admin";

export class TimersEntity extends SimpleEntity {
  readonly ticks: TimerComponent;
  readonly days: TimerComponent;

  constructor(admin: EntityAdmin, readonly id = "timers") {
    super(admin, id);

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

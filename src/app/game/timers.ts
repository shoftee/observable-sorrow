import { CalendarConstants } from "../core/metadata";
import { Entity } from "../ecs";
import { TimerComponent } from "../ecs/common";
import { EntityAdmin } from "./entity-admin";

export class TimersEntity extends Entity {
  ticks!: TimerComponent;
  days!: TimerComponent;

  constructor(admin: EntityAdmin, readonly id = "timers") {
    super(admin, id);
  }

  init(): void {
    this.ticks = this.addComponent(new TimerComponent(1));
    this.days = this.addComponent(
      new TimerComponent(CalendarConstants.TicksPerDay),
    );
  }
}

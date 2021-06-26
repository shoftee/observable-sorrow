import { ChangeTrackedEntity, ComponentState } from "../ecs";
import { CalendarComponent } from ".";
import { EntityAdmin } from "../game/entity-admin";

type CalendarState = ComponentState<CalendarComponent>;

export class EnvironmentEntity extends ChangeTrackedEntity<CalendarState> {
  calendar!: CalendarComponent;

  constructor(admin: EntityAdmin, readonly id = "environment") {
    super(admin, id);
  }

  init(): void {
    this.calendar = this.addComponent(new CalendarComponent());
  }
}

import { ChangeTrackedEntity, ComponentState } from "../ecs";
import { CalendarComponent, WeatherComponent, WeatherState } from ".";
import { EntityAdmin } from "../game/entity-admin";

type CalendarState = ComponentState<CalendarComponent>;

export class EnvironmentEntity extends ChangeTrackedEntity<
  CalendarState & WeatherState
> {
  calendar!: CalendarComponent;
  weather!: WeatherComponent;

  constructor(admin: EntityAdmin, readonly id = "environment") {
    super(admin, id);
  }

  init(): void {
    this.calendar = this.addComponent(new CalendarComponent());
    this.weather = this.addComponent(new WeatherComponent());
  }
}

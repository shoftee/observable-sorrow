import { TickerComponent } from "../ecs/common/ticker";
import { ComponentState, Entity } from "../ecs";
import { CalendarComponent } from ".";
import { EntityAdmin } from "../game/entity-admin";
import { ChangeNotifierComponent } from "../ecs/common";
import { CalendarConstants } from "../core/metadata";

type CalendarState = ComponentState<CalendarComponent>;

export class EnvironmentEntity extends Entity {
  ticker!: DayTickerComponent;
  calendar!: CalendarComponent;
  changes!: ChangeNotifierComponent<CalendarState>;

  constructor(admin: EntityAdmin, readonly id = "environment") {
    super(admin, id);
  }

  init(): void {
    this.ticker = this.addComponent(new DayTickerComponent());
    this.calendar = this.addComponent(new CalendarComponent());
    this.changes = this.addComponent(
      new ChangeNotifierComponent<CalendarState>(),
    );
  }
}

class DayTickerComponent extends TickerComponent {
  constructor() {
    super(CalendarConstants.TicksPerDay);
  }
}

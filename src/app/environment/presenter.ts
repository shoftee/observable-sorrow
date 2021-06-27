import { ref, Ref, unref } from "vue";

import { IRender } from "../ecs";
import { SeasonId, SeasonsMetadata } from "../core/metadata/environment";
import { EntityAdmin } from "../game/entity-admin";
import { EnvironmentEntity } from ".";

export interface IEnvironmentPresenter extends IRender {
  readonly calendar: Ref<CalendarViewModel>;
}

export class EnvironmentPresenter implements IEnvironmentPresenter {
  private readonly environment: EnvironmentEntity;

  readonly calendar: Ref<CalendarViewModel>;

  constructor(admin: EntityAdmin) {
    this.environment = admin.environment();
    this.calendar = ref(new CalendarViewModel()) as Ref<CalendarViewModel>;
  }

  render(): void {
    const entity = this.environment;
    const raw = unref(this.calendar);

    entity.notifier.apply((key) => {
      const calendar = entity.calendar;
      if (key == "day") raw.day = calendar.day;
      if (key == "season") raw.seasonId = calendar.season;
      if (key == "year") raw.year = calendar.year;
    });
  }
}

export class CalendarViewModel {
  day: number;
  season: string;
  year: number;

  constructor() {
    this.day = 0;
    this.season = SeasonsMetadata.spring.label;
    this.year = 0;
  }

  set seasonId(id: SeasonId) {
    this.season = SeasonsMetadata[id].label;
  }
}

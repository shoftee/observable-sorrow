import { ref, Ref, unref } from "vue";

import { IRender } from "../ecs";
import { EnvironmentMetadata } from "../core/metadata/environment";
import { EntityAdmin } from "../game/entity-admin";
import { EnvironmentEntity } from ".";

export interface IEnvironmentPresenter extends IRender {
  readonly calendar: Ref<ICalendarViewModel>;
}

export class EnvironmentPresenter implements IEnvironmentPresenter {
  private readonly environment: EnvironmentEntity;

  readonly calendar: Ref<ICalendarViewModel>;

  constructor(admin: EntityAdmin) {
    this.environment = admin.environment();
    this.calendar = ref({
      dayOfSeason: 0,
      season: EnvironmentMetadata.seasons.spring.label,
      year: 0,
    }) as Ref<ICalendarViewModel>;
  }

  render(): void {
    const entity = this.environment.calendar;
    const raw = unref(this.calendar);
    if (raw.dayOfSeason != entity.dayOfSeason) {
      raw.dayOfSeason = entity.dayOfSeason;
    }

    const season = EnvironmentMetadata.seasons[entity.season];
    if (raw.season != season.label) {
      raw.season = season.label;
    }

    if (raw.year != entity.year) {
      raw.year = entity.year;
    }
  }
}

export interface ICalendarViewModel {
  dayOfSeason: number;
  season: string;
  year: number;
}

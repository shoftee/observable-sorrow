import { ref, Ref, unref } from "vue";

import { IRender } from "../ecs";
import { Environment } from "./entity";
import { EnvironmentMetadata, IEnvironmentMetadata } from "./metadata";

export interface IEnvironmentPresenter extends IRender {
  readonly calendar: Ref<ICalendarViewModel>;
}

export class EnvironmentPresenter implements IEnvironmentPresenter {
  readonly calendar: Ref<ICalendarViewModel>;
  readonly metadata: IEnvironmentMetadata;

  constructor(private environment: Environment) {
    this.metadata = EnvironmentMetadata;
    this.calendar = ref({
      dayOfSeason: 0,
      season: this.metadata.seasons.spring.label,
      year: 0,
    }) as Ref<ICalendarViewModel>;
  }

  render(): void {
    const entity = this.environment.calendar;
    const raw = unref(this.calendar);
    if (raw.dayOfSeason != entity.dayOfSeason) {
      raw.dayOfSeason = entity.dayOfSeason;
    }

    const season = this.metadata.seasons[entity.season];
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

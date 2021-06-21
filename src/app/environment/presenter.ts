import { ref, Ref, unref } from "vue";
import { IEnvironmentMetadata } from ".";
import { Resolver } from "../core";
import { IEntity, IInit, IRender } from "../ecs";
import { EnvironmentEntity } from "./entity";
import { EnvironmentMetadata } from "./metadata";

export interface IEnvironmentPresenter {
  readonly calendar: Ref<ICalendarViewModel>;
}

export class EnvironmentPresenter implements IInit, IRender {
  private entity!: EnvironmentEntity;
  private metadata!: IEnvironmentMetadata;
  readonly calendar: Ref<ICalendarViewModel>;

  constructor() {
    this.calendar = ref<ICalendarViewModel>() as Ref<ICalendarViewModel>;
  }

  init(resolver: Resolver<IEntity>): void {
    this.metadata = EnvironmentMetadata;
    this.entity = resolver.get("environment", EnvironmentEntity);
  }

  render(): void {
    const entity = this.entity.calendar;
    const seasonTitle = this.metadata.seasons[entity.season].title;
    if (this.calendar.value === undefined) {
      this.calendar.value = <ICalendarViewModel>{
        dayOfSeason: entity.dayOfSeason,
        seasonTitle: seasonTitle,
        year: entity.year,
      };
    } else {
      const raw = unref(this.calendar);
      if (raw.dayOfSeason != entity.dayOfSeason) {
        raw.dayOfSeason = entity.dayOfSeason;
      }
      if (raw.seasonTitle != seasonTitle) {
        raw.seasonTitle = seasonTitle;
      }
      if (raw.year != entity.year) {
        raw.year = entity.year;
      }
    }
  }
}

export interface ICalendarViewModel {
  dayOfSeason: number;
  seasonTitle: string;
  year: number;
}

import { ref, Ref, unref } from "vue";
import { IEnvironmentMetadata } from ".";
import { IRender } from "../ecs";
import { IGame, IRegisterInGame } from "../game";
import { EnvironmentEntity } from "./entity";

export interface IEnvironmentPresenter {
  readonly calendar: Ref<ICalendarViewModel>;
}

export class EnvironmentPresenter implements IRegisterInGame, IRender {
  private entity!: EnvironmentEntity;
  private metadata!: IEnvironmentMetadata;
  readonly calendar: Ref<ICalendarViewModel>;

  constructor() {
    this.calendar = ref<ICalendarViewModel>() as Ref<ICalendarViewModel>;
  }

  register(game: IGame): void {
    this.metadata = game.metadata.environment;
    this.entity = game.environment;
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

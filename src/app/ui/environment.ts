import { Ref } from "vue";
import { CalendarState } from "../environment";
import { IGame, IRegisterInGame } from "../systems/game";

export interface IEnvironmentPresenter {
  calendar(): Ref<CalendarState>;
}

export class EnvironmentPresenter
  implements IEnvironmentPresenter, IRegisterInGame
{
  private calendarRef!: Ref<CalendarState>;

  register(game: IGame): void {
    this.calendarRef = game.environment.calendar();
  }

  calendar(): Ref<CalendarState> {
    return this.calendarRef;
  }
}

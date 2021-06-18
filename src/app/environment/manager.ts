import { readonly, Ref, ref, unref } from "vue";

import { EnvironmentState as State } from "../entities/environment";
import { IGame, IRegisterInGame } from "../game/game";
import {
  Constants,
  Metadata,
  IMetadata,
  SeasonKind,
} from "../_metadata/environment";

class Manager implements IRegisterInGame {
  private _state: Ref<State> = ref(new State()) as Ref<State>;

  getState(): Ref<State> {
    return readonly(this._state) as Ref<State>;
  }

  getMeta(): IMetadata {
    return Metadata;
  }

  register(game: IGame): void {
    const ticksPerDay = Constants.SecondsPerDay * Constants.TicksPerSecond;
    const day$ = game.managers.time.every(ticksPerDay);
    day$.subscribe({
      next: (tick: number) => this.update(game, tick),
    });
  }

  update(game: IGame, _tick: number): void {
    const state = unref(this._state);
    state.dayOfSeason++;
    if (state.dayOfSeason >= Constants.DaysPerSeason) {
      state.dayOfSeason -= Constants.DaysPerSeason;
      state.season = this.calculateNextSeason(game, state.season);
      if (state.season == "spring") {
        state.year++;
      }
    }
  }

  private calculateNextSeason(
    game: IGame,
    currentSeason: SeasonKind,
  ): SeasonKind {
    switch (currentSeason) {
      case "spring":
        return "summer";
      case "summer":
        return "autumn";
      case "autumn":
        return "winter";
      case "winter":
        return "spring";
    }
  }
}

export default Manager;

import { readonly, Ref, ref, unref } from "vue";

import {
  IEnvironmentState as IState,
  newEnvironment,
} from "../entities/environment";
import { IGame, IRegisterInGame, IUpdated } from "../systems/game";
import {
  EnvironmentConstants as Constants,
  EnvironmentMetadata as Metadata,
  IEnvironmentMetadata as IMetadata,
  SeasonKind,
} from "../_metadata/environment";

class Manager implements IRegisterInGame, IUpdated {
  private refState: Ref<IState> = ref(newEnvironment()) as Ref<IState>;

  getState(): Ref<IState> {
    return readonly(this.refState) as Ref<IState>;
  }

  getMeta(): IMetadata {
    return Metadata;
  }

  register(game: IGame): void {
    const ticksPerDay = Constants.SecondsPerDay * Constants.TicksPerSecond;
    const day$ = game.time.every(ticksPerDay);
    day$.subscribe({
      next: (tick: number) => this.update(tick),
    });
  }

  update(_tick: number): void {
    const state = unref(this.refState);
    state.dayOfSeason++;
    if (state.dayOfSeason >= Constants.DaysPerSeason) {
      state.dayOfSeason -= Constants.DaysPerSeason;
      state.season = this.calculateNextSeason(state.season);
      if (state.season == "spring") {
        state.year++;
      }
    }
  }

  private calculateNextSeason(currentSeason: SeasonKind): SeasonKind {
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

export { Manager as EnvironmentManager };

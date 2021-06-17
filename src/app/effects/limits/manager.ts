import { ReactiveStateMap } from "@/app/core/entity-state-map";
import { IGame, IRegisterInGame } from "@/app/game/game";
import { Ref } from "@vue/reactivity";
import {
  ILimitMetadata as IMetadata,
  LimitedResourceId as Id,
  Metadata,
} from "./metadata";
import { LimitState } from "./state";

class Manager implements IRegisterInGame {
  private readonly states = new ReactiveStateMap<Id, LimitState>(
    Array.of(new LimitState("catnip")),
  );

  getMeta(id: Id): IMetadata {
    return Metadata[id];
  }

  allMetas(): Iterable<IMetadata> {
    return Object.values(Metadata);
  }

  getState(id: Id): Ref<LimitState> {
    return this.states.get(id);
  }

  allStates(): Ref<LimitState>[] {
    return this.states.all();
  }

  register(game: IGame): void {}
}

export default Manager;

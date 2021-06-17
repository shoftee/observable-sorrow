import { IMutationQueue } from "@/app/game/mutation";
import ResourceManager from "@/app/resources/manager";
import { ResourceId as Id } from "@/app/resources/metadata";
import { ResourceState as State } from "@/app/resources/state";
import { readonly, Ref } from "vue";
import { IGame, IRegisterInGame } from "../../game/game";
import { ChangeAmountMutation } from "./mutations";

class Interactor implements IRegisterInGame {
  private mutationSink!: IMutationQueue;
  private resources!: ResourceManager;

  register(game: IGame): void {
    this.mutationSink = game.managers.updater;
    this.resources = game.managers.resources;
  }

  get(id: Id): Ref<State> {
    return readonly(this.resources.getState(id)) as Ref<State>;
  }

  gatherCatnip(): void {
    const catnip = this.resources.getState("catnip");
    const mutation = new ChangeAmountMutation(catnip, +1);
    this.mutationSink.queue(mutation);
  }
}

export default Interactor;

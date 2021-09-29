import {
  IBonfireInteractor,
  IInteractorSystem,
} from "@/_interfaces/interactor";
import { IGameRunner } from "@/_interfaces/runner";

export class InteractorSystem implements IInteractorSystem {
  constructor(
    readonly bonfire: IBonfireInteractor,
    readonly runner: IGameRunner,
  ) {}
}

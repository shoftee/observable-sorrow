import { IGameRunner } from "../game";
import { IWorkshop } from "./entity";

export interface IWorkshopPresenter {
  gatherCatnip(): void;
  refineCatnip(): void;
}

export class WorkshopPresenter implements IWorkshopPresenter {
  constructor(private workshop: IWorkshop, private runner: IGameRunner) {}

  gatherCatnip(): void {
    this.workshop.order("gather-catnip");
    this.runner.forceUpdate();
  }

  refineCatnip(): void {
    console.log("can't refine catnip yet");
  }
}

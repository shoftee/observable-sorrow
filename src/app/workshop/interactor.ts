import { IGameRunner } from "../game";
import { Workshop } from "./entity";

export interface IWorkshopInteractor {
  gatherCatnip(): void;
  refineCatnip(): void;
}

export class WorkshopInteractor implements IWorkshopInteractor {
  constructor(
    private readonly workshop: Workshop,
    private readonly runner: IGameRunner,
  ) {}

  gatherCatnip(): void {
    this.workshop.order("gather-catnip");
    this.runner.forceUpdate();
  }

  refineCatnip(): void {
    this.workshop.order("refine-catnip");
    this.runner.forceUpdate();
  }
}

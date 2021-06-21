import { Resolver } from "../core";
import { IEntity, IInit } from "../ecs";
import { WorkshopEntity } from "./entity";

export interface IWorkshopPresenter {
  gatherCatnip(): void;
  refineCatnip(): void;
}

export class WorkshopPresenter implements IWorkshopPresenter, IInit {
  private workshop!: WorkshopEntity;

  init(resolver: Resolver<IEntity>): void {
    this.workshop = resolver.get("workshop", WorkshopEntity);
  }

  gatherCatnip(): void {
    this.workshop.order("gather-catnip");
  }

  refineCatnip(): void {
    console.log("can't refine catnip yet");
  }
}

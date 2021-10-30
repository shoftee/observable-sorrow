import {
  BonfireIntent,
  ConstructionIntent,
  IDispatcher,
  Intent,
  ResearchIntent,
  SocietyIntent,
  WorkshopIntent,
} from "@/app/interfaces";

import { EntityAdmin, OrderStatus } from "../entity";

export class Dispatcher implements IDispatcher {
  constructor(private readonly admin: EntityAdmin) {}

  async send(intent: Intent): Promise<void> {
    switch (intent.kind) {
      case "bonfire":
        return this.handleBonfire(intent);

      case "construction":
        return this.handleConstruction(intent);

      case "research":
        return this.handleResearch(intent);

      case "workshop":
        return this.handleWorkshop(intent);

      case "society":
        return this.handleSociety(intent);

      default:
        throw new Error(`intent not supported: ${JSON.stringify(intent)}`);
    }
  }

  private handleBonfire(intent: BonfireIntent): void {
    switch (intent.id) {
      case "gather-catnip":
        this.admin
          .resource("catnip")
          .delta.addDebit(this.admin.player().state.gatherCatnip);
        break;

      case "observe-sky": {
        throw new Error("not implemented");
      }
    }
  }

  private handleConstruction(intent: ConstructionIntent): void {
    switch (intent.id) {
      case "buy-building": {
        const entity = this.admin.building(intent.building);
        if (entity.status === OrderStatus.EMPTY) {
          entity.status = OrderStatus.ORDERED;
        }
        break;
      }
    }
  }

  private handleResearch(intent: ResearchIntent): void {
    switch (intent.id) {
      case "research-tech": {
        const entity = this.admin.tech(intent.tech);
        if (entity.status === OrderStatus.EMPTY) {
          entity.status = OrderStatus.ORDERED;
        }
      }
    }
  }

  private handleSociety(intent: SocietyIntent): void {
    switch (intent.id) {
      case "assign-job": {
        const pop = this.admin.pops().withJob(undefined).first();
        pop.state.job = intent.job;
        break;
      }
      case "unassign-job": {
        const pop = this.admin.pops().withJob(intent.job).first();
        pop.state.job = undefined;
        break;
      }
    }
  }

  private handleWorkshop(intent: WorkshopIntent): void {
    const entity = this.admin.recipe(intent.recipe);
    if (entity.status === OrderStatus.EMPTY) {
      entity.status = OrderStatus.ORDERED;
    }
  }
}

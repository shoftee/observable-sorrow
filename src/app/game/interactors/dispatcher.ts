import {
  AstronomyIntent,
  BonfireIntent,
  ConstructionIntent,
  IDispatcher,
  Intent,
  ResearchIntent,
  SocietyIntent,
  WorkshopIntent,
} from "@/app/interfaces";
import { ResourceMap } from "@/app/state";

import { EntityAdmin, OrderStatus } from "../entity";

export class Dispatcher implements IDispatcher {
  constructor(private readonly admin: EntityAdmin) {}

  async send(intent: Intent): Promise<void> {
    switch (intent.kind) {
      case "astronomy":
        return this.handleAstronomy(intent);

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

  private handleAstronomy(intent: AstronomyIntent): void {
    switch (intent.id) {
      case "observe-sky":
        if (this.admin.stockpile("observe-sky").state.amount > 0) {
          this.admin.environment().observedSky = true;
        }
        break;
    }
  }

  private handleBonfire(intent: BonfireIntent): void {
    switch (intent.id) {
      case "gather-catnip":
        this.admin.rewards().enqueue({
          debits: ResourceMap.fromObject({
            catnip: this.admin.player().state.gatherCatnip,
          }),
          onFulfilled: () => ({}),
        });
        break;
    }
  }

  private handleConstruction(intent: ConstructionIntent): void {
    switch (intent.id) {
      case "buy-building": {
        const entity = this.admin.building(intent.building);
        if (entity.orderStatus === OrderStatus.EMPTY) {
          entity.orderStatus = OrderStatus.ORDERED;
        }
        break;
      }
    }
  }

  private handleResearch(intent: ResearchIntent): void {
    switch (intent.id) {
      case "research-tech": {
        const entity = this.admin.tech(intent.tech);
        if (entity.orderStatus === OrderStatus.EMPTY) {
          entity.orderStatus = OrderStatus.ORDERED;
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
    if (entity.orderStatus === OrderStatus.EMPTY) {
      entity.orderStatus = OrderStatus.ORDERED;
    }
  }
}

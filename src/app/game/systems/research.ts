import { TechnologyId } from "@/app/interfaces";

import { EntityAdmin, OrderStatus } from "../entity";

import { System, OrderHandler, OrderContext, OrderResult } from ".";

export class ResearchSystem extends System {
  private readonly orders: OrderHandler<TechnologyId>;

  constructor(admin: EntityAdmin) {
    super(admin);

    this.orders = new OrderHandler<TechnologyId>(admin);
  }

  update(): void {
    for (const technology of this.admin.technologies()) {
      switch (technology.status) {
        case OrderStatus.ORDERED: {
          this.orders.fulfill(technology.id);
          technology.status = OrderStatus.READY;
          break;
        }
        case OrderStatus.READY: {
          if (this.admin.time().ticks.wholeTicks > 0) {
            technology.status = OrderStatus.EMPTY;
          }
          break;
        }
      }
    }

    this.orders.consume({
      pipeline: [(ctx) => this.applyResearchTech(ctx)],
      success: (ctx) => this.setResearched(ctx),
    });
  }

  private applyResearchTech(context: OrderContext<TechnologyId>): OrderResult {
    const { order, transaction, admin } = context;

    const technology = admin.technology(order);
    const ingredients = technology.state.ingredients;
    for (const { resourceId, requirement } of ingredients) {
      transaction.addCredit(resourceId, requirement);

      const state = admin.resource(resourceId).state;
      const debit = transaction.getDebit(resourceId);
      const credit = transaction.getCredit(resourceId);
      const total = state.amount + debit - credit;
      if (total < 0) {
        return {
          success: false,
          ErrorMessage: `Could not research '${order}' because we needed more '${resourceId}' to satisfy it.`,
        };
      }
    }

    return { success: true };
  }

  private setResearched(context: OrderContext<TechnologyId>): void {
    const { order, admin } = context;

    const technology = admin.technology(order);
    technology.state.researched = true;
  }
}

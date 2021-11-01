import { TechId } from "@/app/interfaces";

import { EntityAdmin, OrderStatus } from "../entity";

import { System, OrderHandler, OrderContext, OrderResult } from ".";

export class ResearchSystem extends System {
  private readonly orders: OrderHandler<TechId>;

  constructor(admin: EntityAdmin) {
    super(admin);

    this.orders = new OrderHandler<TechId>(admin);
  }

  update(): void {
    for (const tech of this.admin.techs()) {
      switch (tech.status) {
        case OrderStatus.ORDERED: {
          this.orders.fulfill(tech.id);
          tech.status = OrderStatus.READY;
          break;
        }
        case OrderStatus.READY: {
          if (this.admin.time().ticks.wholeTicks > 0) {
            tech.status = OrderStatus.EMPTY;
          }
          break;
        }
      }
    }

    this.orders.consume({
      pipeline: [(ctx) => this.applyResearchTech(ctx)],
      success: ({ admin, order }) => {
        admin.tech(order).state.researched = true;
      },
    });
  }

  private applyResearchTech(context: OrderContext<TechId>): OrderResult {
    const { order, transaction, admin } = context;

    const fulfillment = admin.fulfillment(order);
    for (const { resourceId, requirement } of fulfillment.state.ingredients) {
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
}

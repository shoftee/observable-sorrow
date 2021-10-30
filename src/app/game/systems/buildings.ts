import { BuildingId } from "@/app/interfaces";

import { EntityAdmin, OrderStatus } from "../entity";

import { OrderContext, OrderHandler, OrderResult, System } from ".";

export class BuildingSystem extends System {
  private readonly orders: OrderHandler<BuildingId>;

  constructor(admin: EntityAdmin) {
    super(admin);

    this.orders = new OrderHandler<BuildingId>(admin);
  }

  update(): void {
    for (const building of this.admin.buildings()) {
      switch (building.status) {
        case OrderStatus.ORDERED: {
          this.orders.fulfill(building.id);
          building.status = OrderStatus.READY;
          break;
        }
        case OrderStatus.READY: {
          if (this.admin.time().ticks.wholeTicks > 0) {
            building.status = OrderStatus.EMPTY;
          }
          break;
        }
      }
    }

    this.orders.consume({
      pipeline: [(ctx) => this.applyBuyBuilding(ctx)],
      success: (ctx) => this.updateRequirements(ctx),
    });
  }

  private applyBuyBuilding(context: OrderContext<BuildingId>): OrderResult {
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
          ErrorMessage: `Could not craft '${order}' because we needed more '${resourceId}' to satisfy it.`,
        };
      }
    }

    return { success: true };
  }

  private updateRequirements(context: OrderContext<BuildingId>): void {
    const { admin, order } = context;

    const building = admin.building(order);
    const meta = building.meta;
    const state = building.state;

    state.level++;

    const multiplier = Math.pow(meta.prices.ratio, state.level);

    const fulfillment = admin.fulfillment(order);
    for (const ingredient of fulfillment.state.ingredients) {
      const base = meta.prices.base[ingredient.resourceId] ?? 0;
      ingredient.requirement = base * multiplier;
    }
  }
}

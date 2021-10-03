import { BuildingId } from "@/_interfaces";

import { System } from "../ecs/system";
import { EntityAdmin } from "../game/entity-admin";

import { OrderContext, OrderHandler, OrderResult } from "./_orders";

export class BuildingSystem extends System {
  private readonly orders: OrderHandler<BuildingId>;

  constructor(admin: EntityAdmin) {
    super(admin);

    this.orders = new OrderHandler<BuildingId>(admin);
  }

  update(): void {
    for (const building of this.admin.buildings()) {
      if (building.manualConstruct) {
        this.orders.build(building.id);

        building.manualConstruct = false;
      }
    }

    this.orders.consume({
      pipeline: [(ctx) => this.applyBuyBuilding(ctx)],
      success: (ctx) => this.updateRequirements(ctx),
    });
  }

  private applyBuyBuilding(context: OrderContext<BuildingId>): OrderResult {
    const { order, transaction, admin } = { ...context };

    const building = admin.building(order);
    const ingredients = building.state.ingredients;
    for (const { resourceId, requirement } of ingredients) {
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
    const { order } = { ...context };

    const building = context.admin.building(order);
    const meta = building.meta;
    const state = building.state;

    state.level++;

    const multiplier = Math.pow(meta.prices.ratio, state.level);

    for (const ingredient of state.ingredients) {
      const base = meta.prices.baseIngredients[ingredient.resourceId] ?? 0;
      ingredient.requirement = base * multiplier;
    }
  }
}

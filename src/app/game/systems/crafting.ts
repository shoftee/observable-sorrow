import { RecipeId, ResourceId } from "@/app/interfaces";

import { EntityAdmin, OrderStatus } from "../entity";

import { OrderContext, OrderHandler, OrderResult, System } from ".";

export class CraftingSystem extends System {
  private readonly orders: OrderHandler<RecipeId>;

  constructor(admin: EntityAdmin) {
    super(admin);
    this.orders = new OrderHandler<RecipeId>(admin);
  }

  update(): void {
    for (const recipe of this.admin.recipes()) {
      switch (recipe.status) {
        case OrderStatus.ORDERED: {
          this.orders.fulfill(recipe.id);
          recipe.status = OrderStatus.READY;
          break;
        }
        case OrderStatus.READY: {
          if (this.admin.time().ticks.wholeTicks > 0) {
            recipe.status = OrderStatus.EMPTY;
          }
          break;
        }
      }
    }

    this.orders.consume({
      pipeline: [
        (ctx) => this.applyIngredients(ctx),
        (ctx) => this.applyProducts(ctx),
      ],
    });
  }

  private applyIngredients(context: OrderContext<RecipeId>): OrderResult {
    const { order, transaction, admin } = context;

    const entity = admin.recipe(order);
    const ingredients = entity.state.ingredients;
    for (const { resourceId, requirement } of ingredients.values()) {
      transaction.addCredit(resourceId, requirement);

      if (!this.satisfiesRequirementAfterDelta(context, resourceId)) {
        return {
          success: false,
          ErrorMessage: `Could not craft '${order}' because we needed more '${resourceId}' to satisfy it.`,
        };
      }
    }

    return { success: true };
  }

  private satisfiesRequirementAfterDelta(
    context: OrderContext<RecipeId>,
    resourceId: ResourceId,
  ): boolean {
    const { transaction, admin } = context;

    const { amount } = admin.resource(resourceId).state;
    const debit = transaction.getDebit(resourceId);
    const credit = transaction.getCredit(resourceId);

    return amount + debit - credit >= 0;
  }

  private applyProducts(context: OrderContext<RecipeId>): OrderResult {
    const { order, transaction, admin } = context;
    const entity = admin.recipe(order);

    let capped = true;
    const products = entity.state.products;
    for (const [resourceId, producedAmount] of products.entries()) {
      transaction.addDebit(resourceId, producedAmount);

      // For a order to be considered 'capped',
      // all products need to be capped.
      capped = capped && this.isCappedAfterDelta(context, resourceId);
    }

    if (capped) {
      return {
        success: false,
        ErrorMessage: `Could not craft '${order}' because there's no space for the crafted materials.`,
      };
    }

    return { success: true };
  }

  private isCappedAfterDelta(
    context: OrderContext<RecipeId>,
    resourceId: ResourceId,
  ): boolean {
    const { transaction, admin } = context;

    const { amount, capacity } = admin.resource(resourceId).state;
    if (!capacity) {
      return false;
    }

    const debit = transaction.getDebit(resourceId);
    const credit = transaction.getCredit(resourceId);

    const total = amount + debit - credit;
    return total >= capacity && amount >= capacity;
  }
}

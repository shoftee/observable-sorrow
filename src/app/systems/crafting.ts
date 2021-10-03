import { RecipeId } from "@/_interfaces";

import { EntityAdmin } from "../entity";

import { OrderContext, OrderHandler, OrderResult, System } from ".";

export class CraftingSystem extends System {
  private readonly orders: OrderHandler<RecipeId>;

  constructor(admin: EntityAdmin) {
    super(admin);
    this.orders = new OrderHandler<RecipeId>(admin);
  }

  update(): void {
    for (const recipe of this.admin.recipes()) {
      if (recipe.manualCraft) {
        this.orders.build(recipe.id);
        recipe.manualCraft = false;
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
    const { order, transaction, admin } = { ...context };

    const entity = admin.recipe(order);
    const ingredients = entity.state.ingredients;
    for (const { resourceId, requirement } of ingredients.values()) {
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

  private applyProducts(context: OrderContext<RecipeId>): OrderResult {
    const { order, transaction, admin } = { ...context };
    const entity = admin.recipe(order);

    let capped = true;
    const products = entity.state.products;
    for (const [resourceId, amount] of products.entries()) {
      transaction.addDebit(resourceId, amount);

      // We only need to check the following
      // until we find at least one uncapped product.
      if (capped) {
        const state = admin.resource(resourceId).state;
        const debit = transaction.getDebit(resourceId);
        const credit = transaction.getCredit(resourceId);
        const total = state.amount + debit - credit;

        const effectiveCapacity = state.capacity ?? Number.POSITIVE_INFINITY;
        capped = capped && total > effectiveCapacity;
      }
    }

    if (capped) {
      return {
        success: false,
        ErrorMessage: `Could not craft '${order}' because there's no space for the crafted materials.`,
      };
    }

    return { success: true };
  }
}

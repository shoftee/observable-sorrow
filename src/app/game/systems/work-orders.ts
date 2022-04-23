import { ResourceId } from "@/app/interfaces";
import { ResourceMap, TransactionSpec } from "@/app/state";
import { OrderContext as OrderCtx, OrderHandler, OrderResult, System } from ".";
import {
  BuildingEntity,
  OrderStatus,
  RecipeEntity,
  TechEntity,
} from "../entity";

type TransactionOrder = TransactionSpec & {
  fulfillment: ResourceMap;
};

export class WorkOrdersSystem extends System {
  private readonly transactions = new OrderHandler<TransactionOrder>({
    apply: applyTransactionOrder,
    success: ({ order }) => order.onFulfilled(order.fulfillment),
  });
  private readonly crafting = new OrderHandler<RecipeEntity>({
    apply: applyCraftingOrder,
  });
  private readonly research = new OrderHandler<TechEntity>({
    apply: applyResearchOrder,
    success: ({ order }) => {
      order.state.researched = true;
    },
  });
  private readonly construction = new OrderHandler<BuildingEntity>({
    apply: applyConstructionOrder,
    success: ({ order }) => {
      order.state.level++;
    },
  });

  update(): void {
    // process free-form transactions
    for (const tx of this.admin.transactions().all()) {
      this.transactions.enqueue({ ...tx, fulfillment: new ResourceMap() });
    }
    this.transactions.consume(this.admin);

    // process crafting, research, construction
    const isNewTick = this.admin.time().ticks.wholeTicks > 0;
    this.processOrdered(this.crafting, this.admin.recipes(), isNewTick);
    this.processOrdered(this.research, this.admin.techs(), isNewTick);
    this.processOrdered(this.construction, this.admin.buildings(), isNewTick);
  }

  private processOrdered<TOrder extends { orderStatus: OrderStatus }>(
    orderHandler: OrderHandler<TOrder>,
    entities: Iterable<TOrder>,
    isNewTick: boolean,
  ) {
    // Determine which orders need processing.
    for (const entity of entities) {
      if (entity.orderStatus === OrderStatus.ORDERED) {
        orderHandler.enqueue(entity);

        // NOTE: Order will be complete by the end of the update so we can set it to READY here.
        entity.orderStatus = OrderStatus.READY;
      } else if (isNewTick && entity.orderStatus === OrderStatus.READY) {
        entity.orderStatus = OrderStatus.EMPTY;
      }
    }

    orderHandler.consume(this.admin);
  }
}

function applyTransactionOrder(
  context: OrderCtx<TransactionOrder>,
): OrderResult {
  const { order, transaction, admin } = context;

  // Determine if credits put us in the negatives.
  // NOTE: Some transactions are "free" and have no credits.
  for (const [id, credit] of order.credits ?? []) {
    transaction.addCredit(id, credit);

    const { amount } = admin.resource(id).state;
    if (amount < credit) {
      return {
        success: false,
        ErrorMessage: `Could not complete transaction because we needed more '${id}'.`,
      };
    }
  }

  // Lack of space will never cause a transactions to fail.
  // However, we want to collect fulfillment information.
  for (const [id, quantity] of order.debits ?? []) {
    transaction.addDebit(id, quantity);

    const { amount, capacity } = admin.resource(id).state;
    if (capacity) {
      const debit = transaction.getDebit(id);
      const credit = transaction.getCredit(id);
      const total = amount + debit - credit;

      // if total > capacity, record only the part until cap.
      order.fulfillment.set(id, Math.min(capacity, total) - amount);
    } else {
      // resources that are uncapped are always fulfilled completely.
      order.fulfillment.set(id, quantity);
    }
  }

  return { success: true };
}

function applyResearchOrder(context: OrderCtx<TechEntity>): OrderResult {
  const { order, transaction, admin } = context;

  const fulfillment = admin.fulfillment(order.id);
  for (const { resourceId, requirement } of fulfillment.state.ingredients) {
    transaction.addCredit(resourceId, requirement);

    const state = admin.resource(resourceId).state;
    const debit = transaction.getDebit(resourceId);
    const credit = transaction.getCredit(resourceId);
    const total = state.amount + debit - credit;
    if (total < 0) {
      return {
        success: false,
        ErrorMessage: `Could not research '${order.id}' because we needed more '${resourceId}' to satisfy it.`,
      };
    }
  }

  return { success: true };
}

function applyConstructionOrder(
  context: OrderCtx<BuildingEntity>,
): OrderResult {
  const { order, transaction, admin } = context;

  const fulfillment = admin.fulfillment(order.id);
  for (const { resourceId, requirement } of fulfillment.state.ingredients) {
    transaction.addCredit(resourceId, requirement);

    const state = admin.resource(resourceId).state;
    const debit = transaction.getDebit(resourceId);
    const credit = transaction.getCredit(resourceId);
    const total = state.amount + debit - credit;
    if (total < 0) {
      return {
        success: false,
        ErrorMessage: `Could not craft '${order.id}' because we needed more '${resourceId}' to satisfy it.`,
      };
    }
  }

  return { success: true };
}

function applyCraftingOrder(context: OrderCtx<RecipeEntity>): OrderResult {
  const { order, transaction, admin } = context;

  // Determine if all ingredient requirements are fulfilled.
  const fulfillment = admin.fulfillment(order.id);
  for (const { resourceId, requirement } of fulfillment.state.ingredients) {
    transaction.addCredit(resourceId, requirement);

    if (!satisfiesRequirementAfterDelta(context, resourceId)) {
      return {
        success: false,
        ErrorMessage: `Could not craft '${order}' because we needed more '${resourceId}' to satisfy it.`,
      };
    }
  }

  // Determine if production will have no effect, block if so.
  const recipe = admin.recipe(order.id);

  let capped = true;
  const products = recipe.state.products;
  for (const [resourceId, producedAmount] of products.entries()) {
    transaction.addDebit(resourceId, producedAmount);

    // For a order to be considered 'capped',
    // all products need to be capped.
    capped = capped && isCappedAfterDelta(context, resourceId);
  }

  if (capped) {
    return {
      success: false,
      ErrorMessage: `Could not craft '${order.id}' because there's no space for the crafted materials.`,
    };
  }

  return { success: true };
}

function satisfiesRequirementAfterDelta(
  context: OrderCtx<RecipeEntity>,
  resourceId: ResourceId,
): boolean {
  const { transaction, admin } = context;

  const { amount } = admin.resource(resourceId).state;
  const debit = transaction.getDebit(resourceId);
  const credit = transaction.getCredit(resourceId);

  return amount + debit - credit >= 0;
}

function isCappedAfterDelta(
  context: OrderCtx<RecipeEntity>,
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

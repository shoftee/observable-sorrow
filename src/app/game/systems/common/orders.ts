import { Queue } from "queue-typescript";

import { Ledger } from "@/app/state";

import { EntityAdmin } from "@/app/game/entity";

export type OrderResult =
  | { success: false; ErrorMessage: string }
  | { success: true };

export type OrderContext<T> = {
  admin: EntityAdmin;
  transaction: Ledger;
  order: T;
};

type OrderHandlersType<T> = {
  apply: ApplyOrderFn<T>;
  success?: OrderCtxFn<T> | undefined;
  failure?: OrderCtxFn<T> | undefined;
};

type ApplyOrderFn<T> = (ctx: OrderContext<T>) => OrderResult;
type OrderCtxFn<T> = (ctx: OrderContext<T>) => void;

export class OrderHandler<T> {
  private readonly queue = new Queue<T>();

  constructor(private readonly handlers: OrderHandlersType<T>) {}

  enqueue(order: T): void {
    this.queue.enqueue(order);
  }

  consume(admin: EntityAdmin): void {
    const { apply, success, failure } = this.handlers;

    // Initialize the ambient ledger.
    const ambient = new Ledger();
    for (const { id, stockpile } of admin.resources()) {
      ambient.add(id, stockpile);
    }

    for (const order of this.consumeOrders()) {
      // Create ledger layer for this order.
      // If the order fails, we can safely discard the whole layer.
      const transaction = new Ledger(ambient);

      const context = { admin, transaction, order };
      const result = this.applyOrder(context, apply);

      if (result.success) {
        // Apply changes to base resource.
        for (const [id, stockpile] of transaction.entries()) {
          const resource = admin.resource(id);
          resource.stockpile.add(stockpile);
        }

        transaction.rebase();

        if (success) {
          success(context);
        }
      } else {
        // TODO: Send error message back to presenters.
        if (failure) {
          failure(context);
        }
      }
    }

    // Clear ambient values.
    ambient.clear();
  }

  private *consumeOrders(): IterableIterator<T> {
    let order;
    while ((order = this.queue.dequeue())) {
      yield order;
    }
  }

  private applyOrder(
    context: OrderContext<T>,
    applier: ApplyOrderFn<T>,
  ): OrderResult {
    try {
      return applier(context);
    } catch (error) {
      console.log(error);
      if (typeof error === "string") {
        return { success: false, ErrorMessage: error };
      }

      return { success: false, ErrorMessage: `Internal error: ${error}` };
    }
  }
}

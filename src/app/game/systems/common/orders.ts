import { Queue } from "queue-typescript";

import { DeltaSet, EntityAdmin } from "@/app/game/entity";

export type OrderResult =
  | { success: false; ErrorMessage: string }
  | { success: true };

export type OrderContext<T> = {
  admin: EntityAdmin;
  transaction: DeltaSet;
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

    // Initialize the ambient deltas.
    const ambient = new DeltaSet();
    for (const { id, delta } of admin.resources()) {
      ambient.addDelta(id, delta);
    }

    for (const order of this.consumeOrders()) {
      // Create delta layer for this order.
      // If the order fails, we can safely discard the whole layer.
      const transaction = new DeltaSet(ambient);

      const context = { admin: admin, transaction, order };
      const result = this.applyOrder(context, apply);

      if (result.success) {
        // Apply changes to base resource deltas.
        for (const [id, delta] of transaction.deltas()) {
          const resource = admin.resource(id);
          resource.delta.addDelta(delta);
        }

        transaction.merge(true);

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

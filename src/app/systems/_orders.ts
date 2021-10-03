import { Queue } from "queue-typescript";

import { EntityAdmin } from "../game";
import { DeltaSet } from "../resources/state";

export type OrderResult =
  | { success: false; ErrorMessage: string }
  | { success: true };

export type OrderContext<T> = {
  admin: EntityAdmin;
  transaction: DeltaSet;
  order: T;
};

export type OrderApplierFn<T> = (ctx: OrderContext<T>) => OrderResult;
export type OrderCtxFn<T> = (ctx: OrderContext<T>) => void;

export class OrderHandler<T> {
  private readonly queue = new Queue<T>();

  constructor(readonly admin: EntityAdmin) {}

  private *orders(): IterableIterator<T> {
    let order;
    while ((order = this.queue.dequeue())) {
      yield order;
    }
  }

  build(order: T): void {
    this.queue.enqueue(order);
  }

  consume(handlers: {
    pipeline: OrderApplierFn<T>[];
    success?: OrderCtxFn<T> | undefined;
    failure?: OrderCtxFn<T> | undefined;
  }): void {
    const ambient = new DeltaSet();
    // Initialize the ambient deltas.
    for (const { id, delta } of this.admin.resources()) {
      ambient.addDelta(id, delta);
    }

    for (const order of this.orders()) {
      // Create delta layer for this order.
      // If the order fails, we can safely discard the whole layer.
      const transaction = new DeltaSet(ambient);

      const context = { admin: this.admin, transaction, order };
      const result = this.runPipeline(context, handlers.pipeline);

      if (result.success) {
        // Apply changes to base resource deltas.
        for (const [id, delta] of transaction.deltas()) {
          const resource = this.admin.resource(id);
          resource.delta.addDelta(delta);
        }

        transaction.merge(true);

        if (handlers.success) {
          handlers.success(context);
        }
      } else {
        // TODO: Send error message back to presenters.
        if (handlers.failure) {
          handlers.failure(context);
        }
      }
    }

    // Clear ambient values.
    ambient.clear();
  }

  private runPipeline(
    context: OrderContext<T>,
    pipeline: OrderApplierFn<T>[],
  ): OrderResult {
    for (const applier of pipeline) {
      const result = applier(context);
      if (!result.success) {
        return result;
      }
    }

    return { success: true };
  }
}

import { Queue } from "queue-typescript";

import { TransactionSpec } from "@/app/state";

import { Entity } from ".";

export class TransactionsEntity extends Entity<"transactions"> {
  private readonly queue = new Queue<TransactionSpec>();

  constructor() {
    super("transactions");
  }

  enqueue(tx: TransactionSpec) {
    this.queue.enqueue(tx);
  }

  *all(): Iterable<TransactionSpec> {
    let tx;
    while ((tx = this.queue.dequeue())) {
      yield tx;
    }
  }
}

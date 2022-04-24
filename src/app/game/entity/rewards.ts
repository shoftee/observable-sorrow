import { Queue } from "queue-typescript";

import { RewardSpec } from "@/app/state";

import { Entity } from ".";

export class RewardsEntity extends Entity<"rewards"> {
  private readonly queue = new Queue<RewardSpec>();

  constructor() {
    super("rewards");
  }

  enqueue(tx: RewardSpec) {
    this.queue.enqueue(tx);
  }

  *all(): Iterable<RewardSpec> {
    let tx;
    while ((tx = this.queue.dequeue())) {
      yield tx;
    }
  }
}

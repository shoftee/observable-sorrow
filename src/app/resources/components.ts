import { Component } from "../ecs";
import { QueueComponent } from "../ecs/common";

export class ResourceStateComponent extends Component {
  unlocked = false;
  amount = 0;
  change = 0;
  capacity?: number;

  get effectiveCapacity(): number {
    return this.capacity ?? Number.POSITIVE_INFINITY;
  }
}

export class MutationComponent extends QueueComponent<number> {
  give(n: number): void {
    this.enqueue(n);
  }

  take(n: number): void {
    this.enqueue(-n);
  }

  sum(): number {
    let total = 0;
    this.consume((item) => {
      total += item;
    });
    return total;
  }
}

import { QueueComponent } from "../ecs/common";

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

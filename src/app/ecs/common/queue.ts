import { Queue } from "queue-typescript";
import { Component } from "..";

export class QueueComponent<T> extends Component {
  private readonly queue: Queue<T> = new Queue<T>();

  protected enqueue(c: T): void {
    this.queue.enqueue(c);
  }

  protected dequeue(): T | undefined {
    return this.queue.dequeue();
  }

  protected get length(): number {
    return this.queue.length;
  }

  protected consume(callback: (item: T) => void): void {
    let item: T | undefined;
    while ((item = this.dequeue()) != undefined) {
      callback(item);
    }
  }
}

export class RawQueueComponent<T> extends QueueComponent<T> {
  enqueue(c: T): void {
    super.enqueue(c);
  }

  dequeue(): T | undefined {
    return super.dequeue();
  }

  consume(callback: (item: T) => void): void {
    super.consume(callback);
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

import { Queue } from "queue-typescript";
import { Component } from "..";

export class QueueComponent<T> extends Component {
  private readonly queue: Queue<T> = new Queue<T>();

  enqueue(c: T): void {
    this.queue.enqueue(c);
  }

  dequeue(): T | undefined {
    return this.queue.dequeue();
  }

  consume(callback: (item: T) => void): void {
    let item: T | undefined;
    while ((item = this.dequeue()) != undefined) {
      callback(item);
    }
  }
}

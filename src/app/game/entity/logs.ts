import { EventId } from "@/app/interfaces";
import { HistoryEvent } from "@/app/state";

import { Buffer } from ".";

export abstract class EventEntity<TEvent> {
  constructor(readonly id: EventId, private readonly buffer: Buffer) {}

  push(event: TEvent): void {
    this.buffer.push(event);
  }
}

export class HistoryEntity extends EventEntity<HistoryEvent> {
  constructor(buffer: Buffer) {
    super("history", buffer);
  }
}

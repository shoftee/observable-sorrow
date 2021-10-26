import { EventId } from "@/app/interfaces";
import { HistoryEvent, Kind } from "@/app/state";
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

  label(label: string, data?: Record<string, unknown>): void {
    super.push({ kind: Kind.Label, label, data });
  }

  countLabel(
    label: string,
    count: number,
    data?: Record<string, unknown>,
  ): void {
    super.push({ kind: Kind.CountLabel, label, count, data });
  }
}

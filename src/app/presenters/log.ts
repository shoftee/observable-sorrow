import { useI18n } from "vue-i18n";

import { StateManager } from ".";
import { HistoryEvent, Kind } from "../state";

export class LogPresenter {
  private eventId = 0;

  constructor(manager: StateManager) {
    manager.history().subscribe((events) => {
      for (const event of events) {
        document.dispatchEvent(
          new CustomEvent<LogItem>("onlogmessage", {
            detail: { id: this.eventId++, resolve: (t) => resolve(t, event) },
          }),
        );
      }
    });
  }
}

type TextComposer = ReturnType<typeof useI18n>["t"];

function resolve(t: TextComposer, event: HistoryEvent): string {
  switch (event.kind) {
    case Kind.Text:
      return event.text;

    case Kind.Label:
      return t(event.label, event.data ?? {});

    case Kind.CountLabel:
      return t(event.label, event.data ?? {}, event.count);

    default:
      throw new Error("unexpected event kind");
  }
}

export interface LogItem {
  id: number;
  resolve: (t: TextComposer) => string;
}

interface LogItemEventMap {
  onlogmessage: CustomEvent<LogItem>;
}

type LogListener<K extends keyof LogItemEventMap> = (
  this: Document,
  event: LogItemEventMap[K],
) => void;

declare global {
  interface Document {
    addEventListener<K extends keyof LogItemEventMap>(
      type: K,
      listener: LogListener<K>,
    ): void;
    removeEventListener<K extends keyof LogItemEventMap>(
      type: K,
      listener: LogListener<K>,
    ): void;
  }
}

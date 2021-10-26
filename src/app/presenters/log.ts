import { useI18n } from "vue-i18n";

import { StateManager } from ".";
import { Disposition, HistoryEvent, Kind } from "../state";

export class LogPresenter {
  private eventId = 0;

  constructor(manager: StateManager) {
    manager.history().subscribe((events) => {
      for (const event of events) {
        if (event.disposition !== Disposition.Ignore) {
          document.dispatchEvent(
            new CustomEvent<LogItem>("onlogmessage", {
              detail: { id: this.eventId++, resolve: (t) => resolve(t, event) },
            }),
          );
        }
      }
    });
  }
}

type TextComposer = ReturnType<typeof useI18n>["t"];

function resolve(t: TextComposer, event: HistoryEvent): string {
  switch (event.kind) {
    case Kind.Label:
      return t(event.label, event.named ?? {});

    case Kind.PluralLabel:
      return t(event.label, event.named ?? {}, event.plural);

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

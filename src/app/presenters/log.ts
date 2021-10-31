import { useI18n } from "vue-i18n";

import { NumberFormatter, StateManager } from ".";
import { HistoryEvent } from "../state";

export class LogPresenter {
  private eventId = 0;

  constructor(manager: StateManager) {
    manager.history().subscribe((events) => {
      for (const event of events) {
        if (event.disposition !== "ignore") {
          document.dispatchEvent(
            new CustomEvent<LogItem>("onlogmessage", {
              detail: {
                id: this.eventId++,
                resolve: (t, fmt) => resolve(t, fmt, event),
              },
            }),
          );
        }
      }
    });
  }
}

type TextComposer = ReturnType<typeof useI18n>["t"];

function resolve(
  t: TextComposer,
  fmt: NumberFormatter,
  event: HistoryEvent,
): string {
  const named = event.named ?? {};

  // format numbers
  for (const key in named) {
    if (Object.prototype.hasOwnProperty.call(event.named, key)) {
      const element = named[key];
      if (typeof element === "number") {
        named[key] = fmt.number(element);
      }
    }
  }

  switch (event.kind) {
    case "label":
      return t(event.label, named ?? {});

    case "plural-label":
      return t(event.label, named ?? {}, event.plural);

    default:
      throw new Error("unexpected event kind");
  }
}

export interface LogItem {
  id: number;
  resolve: (t: TextComposer, fmt: NumberFormatter) => string;
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

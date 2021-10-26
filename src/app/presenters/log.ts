import { StateManager } from ".";
import { HistoryEvent } from "../state";

export class LogPresenter {
  private eventId = 0;

  constructor(manager: StateManager) {
    manager.history().subscribe((events) => {
      for (const event of events) {
        document.dispatchEvent(
          new CustomEvent<LogItem>("onlogmessage", {
            detail: { id: this.eventId++, event: event },
          }),
        );
      }
    });
  }
}

export interface LogItem {
  id: number;
  event: HistoryEvent;
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

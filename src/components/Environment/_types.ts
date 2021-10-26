import { Calendar } from "@/app/presenters";

export interface LogEpoch {
  id: number;
  year: number;
  seasonLabel: string;
  ref?: Element | undefined;
  events: {
    id: number;
    text: string;
    ref?: Element | undefined;
  }[];
}

export function newLogEpoch(id: number, calendar: Calendar): LogEpoch {
  // Use non-reactive copies, otherwise old epochs will change with current calendar.
  const { year, seasonLabel } = calendar;
  return {
    id: id,
    year: year,
    seasonLabel: seasonLabel,
    events: [],
  };
}

export function removeClippedEvents(
  epochs: LogEpoch[],
  container: Element,
): void {
  for (let i = 0; i < epochs.length; i++) {
    const epoch = epochs[i];
    if (epoch.ref === undefined) {
      continue;
    }

    if (
      i > 0 &&
      (epoch.ref as HTMLElement).offsetTop > container.clientHeight
    ) {
      // everything after this point must go.
      epochs.splice(i);
      continue;
    }

    const evts = epoch.events;
    for (let j = 0; j < evts.length; j++) {
      const event = evts[j];
      if (event.ref === undefined) {
        continue;
      }

      if ((event.ref as HTMLElement).offsetTop > container.clientHeight) {
        // everything after this point must go.
        evts.splice(j);
      }
    }
  }
}

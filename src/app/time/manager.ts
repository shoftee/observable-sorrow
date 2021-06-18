import { ITimeManager } from "../systems/time";
import { Constants } from "./constants";
import { Observable, Subject, interval } from "rxjs";
import { filter } from "rxjs/operators";

class TimeManager implements ITimeManager {
  private readonly interval$ = interval(Constants.MillisecondsPerTick);
  private readonly tick$: Subject<number>;

  constructor() {
    this.tick$ = new Subject();
  }

  start(): void {
    this.interval$.subscribe(this.tick$);
  }

  every(frequency?: number): Observable<number> {
    if (frequency === undefined || frequency <= 1) {
      return this.tick$;
    } else {
      return this.tick$.pipe(filter((tick: number) => tick % frequency === 0));
    }
  }

  // use Rx throttle operator for pawsing
}

export { TimeManager };

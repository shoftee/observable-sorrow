import { Observable } from "rxjs";

interface ITimeManager {
  start(): void;
  every(frequency?: number): Observable<number>;
}

export { ITimeManager };

import { Observable } from "rxjs";
interface IGameObserver {
  ticks(): Observable<number>;
  days(): Observable<number>;
}

interface IGame {
  readonly observer: IGameObserver;
}

export { IGameObserver, IGame };

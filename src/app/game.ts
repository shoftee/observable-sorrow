import { Subject, Observable, interval } from "rxjs";
import { filter, map } from "rxjs/operators";

import Constants from "./constants";

export interface IGameObserver {
    ticks(): Observable<number>;
    days(): Observable<number>;
}

class GameObserver implements IGameObserver {
    readonly tick$ = new Subject<number>();

    constructor(game: Game) {
        game.tick$.subscribe(this.tick$);
    }

    ticks(): Observable<number> {
        return this.tick$;
    }

    days(): Observable<number> {
        const ticksPerDay = Constants.TicksPerSecond * Constants.SecondsPerDay;
        return this.tick$.pipe(
            filter(v => v % ticksPerDay === 0),
            map(v => v / ticksPerDay),
        );
    }
}

import { StateManager } from "./manager";

export interface IGame {
    observer(): IGameObserver;
    reactive(): StateManager;
}

class Game implements IGame {
    readonly _observer: IGameObserver;
    readonly _entities: StateManager;
    tick$ = interval(Constants.MillisecondsPerTick);

    constructor() {
        this._observer = new GameObserver(this);
        this._entities = new StateManager();

        this._entities.resources();
    }

    observer(): IGameObserver {
        return this._observer;
    }

    reactive(): StateManager {
        return this._entities;
    }
}

export const Instance: IGame = new Game();
export default Instance;
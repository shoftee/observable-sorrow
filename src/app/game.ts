import { Subject, Observable, Subscribable, interval } from "rxjs";

export interface IGame {
    readonly observer: IGameObserver;
}

class Game implements IGame {
    readonly observer: IGameObserver;

    tick$ = interval(200);

    constructor() {
        this.observer = new GameObserver(this);
    }
}

export interface IGameObserver {
    ticks(): Observable<number>;
}

class GameObserver implements IGameObserver {
    readonly tick$ = new Subject<number>();

    constructor(game: Game) {
        game.tick$.subscribe(this.tick$);
    }

    ticks(): Observable<number> {
        return this.tick$;
    }
}

export const Instance: IGame = new Game();
export default Instance;
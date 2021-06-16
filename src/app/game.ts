import { IGameObserver } from "./core/_interfaces";
import Constants from "./core/_constants";

import { Subject, Observable, interval } from "rxjs";
import { filter, map } from "rxjs/operators";

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
      filter((v) => v % ticksPerDay === 0),
      map((v) => v / ticksPerDay),
    );
  }
}

import { ResourceManager } from "./resources/manager";
import { LimitsManager } from "./effects/limits/manager";
import { Queue } from "queue-typescript";
import { IMutation, IMutationSink } from "./core/mutation";

interface IGame {
  readonly observer: IGameObserver;
  readonly resources: ResourceManager;
  readonly limits: LimitsManager;
}

class Game implements IGame {
  private readonly updater: GameUpdater;

  readonly resources: ResourceManager;
  readonly limits: LimitsManager;

  readonly observer: IGameObserver;
  tick$ = interval(Constants.MillisecondsPerTick);

  constructor() {
    this.observer = new GameObserver(this);
    this.updater = new GameUpdater(this.observer);

    this.resources = new ResourceManager(this.updater);
    this.limits = new LimitsManager(this.updater);
  }
}

class GameUpdater implements IMutationSink {
  private mutationQueue = new Queue<IMutation>();

  constructor(readonly observer: IGameObserver) {
    observer.ticks().subscribe({
      next: () => this.doUpdates(),
    });
  }

  send(m: IMutation) {
    this.mutationQueue.enqueue(m);
  }

  private doUpdates() {
    let m: IMutation;
    while ((m = this.mutationQueue.dequeue())) {
      console.log("Applying mutation: ", m);
      m.apply();
    }
  }
}

const Instance: IGame = new Game();
export default Instance;

import { Queue } from "queue-typescript";
import { IMutation, IMutationQueue } from "./mutation";
import { IGame } from "./game";

class Updater implements IMutationQueue {
  private mutationQueue = new Queue<IMutation>();

  register(game: IGame): void {
    game.managers.time.every().subscribe({
      next: () => this.doUpdates(),
    });
  }

  queue(mutation: IMutation): void {
    this.mutationQueue.enqueue(mutation);
  }

  private doUpdates() {
    let m: IMutation;
    while ((m = this.mutationQueue.dequeue())) {
      m.apply();
    }
  }
}

export default Updater;

import { SaveState } from "@/app/store";
import { Prng, random } from "@/app/utils/mathx";

import { Entity, Persisted } from ".";

export class PrngEntity extends Entity<"prng"> implements Persisted {
  private _environment: Prng;

  constructor() {
    super("prng");

    const prng = random(Date.now());
    this._environment = prng.fork();
  }

  loadState(save: SaveState): void {
    if (save.seeds?.environment !== undefined) {
      this._environment = random(save.seeds.environment);
    }
  }

  saveState(save: SaveState): void {
    save.seeds = {
      environment: this._environment.state(),
    };
  }

  environment(): number {
    return this._environment.next();
  }
}

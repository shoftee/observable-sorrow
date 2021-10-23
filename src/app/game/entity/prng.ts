import { SaveState } from "@/app/store";
import { Prng, random } from "@/app/utils/mathx";

import { Entity } from ".";

export class PrngEntity extends Entity<"prng"> {
  private _environment: Prng;

  constructor() {
    super("prng");

    const prng = random(Date.now());
    this._environment = prng.fork();
  }

  loadState(save: SaveState): void {
    if (save.seeds) {
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

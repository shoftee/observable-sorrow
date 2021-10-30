import { SaveState } from "@/app/store";
import { Prng, random } from "@/app/utils/mathx";

import { Entity, Persisted } from ".";

export class PrngEntity extends Entity<"prng"> implements Persisted {
  private _astronomy: Prng;
  private _environment: Prng;

  constructor() {
    super("prng");

    const prng = random(Date.now());
    this._astronomy = prng.fork();
    this._environment = prng.fork();
  }

  loadState(save: SaveState): void {
    if (save.seeds?.astronomy !== undefined) {
      this._astronomy = random(save.seeds.astronomy);
    }
    if (save.seeds?.environment !== undefined) {
      this._environment = random(save.seeds.environment);
    }
  }

  saveState(save: SaveState): void {
    save.seeds = {
      astronomy: this._astronomy.state(),
      environment: this._environment.state(),
    };
  }

  environment(): number {
    return this._environment.next();
  }

  astronomy(): number {
    return this._astronomy.next();
  }
}

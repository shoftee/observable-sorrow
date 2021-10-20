import { Prng, random } from "@/app/utils/mathx";

import { Entity } from ".";

export class PrngEntity extends Entity<"prng"> {
  private readonly _environment: Prng;

  constructor() {
    super("prng");

    const prng = random(Date.now() | 0);
    this._environment = prng.fork();
  }

  environment(): number {
    return this._environment.next();
  }
}

import { trunc } from "@/_utils/mathx";

import { System } from ".";

export class PopulationSystem extends System {
  private readonly growthPerTick = 0.01;
  private readonly starvationPerTick = -0.2;

  update(): void {
    this.updatePops();
    this.updateSociety();
    this.updateStockpile();
  }

  private updatePops() {
    const society = this.admin.society();
    const state = society.state;
    const effectiveStockpile = trunc(state.stockpile);
    if (effectiveStockpile >= 1) {
      // A new pop has grown
      this.admin.pops().grow(effectiveStockpile);
      state.stockpile -= effectiveStockpile;
    } else if (effectiveStockpile <= -1) {
      // A full pop has starved
      this.admin.pops().kill(Math.abs(effectiveStockpile));
      state.stockpile -= effectiveStockpile;
    }
  }

  private updateSociety() {
    const society = this.admin.society();

    const kittens = this.admin.resource("kittens");

    const pops = this.admin.pops();
    society.state.totalPops = pops.size;
    society.state.unemployedPops = pops
      .enumerate()
      .count((item) => item.state.job === undefined);

    kittens.state.amount = pops.size;
  }

  private updateStockpile() {
    const dt = this.admin.time().ticks.delta;
    const society = this.admin.society().state;
    const kittens = this.admin.resource("kittens");
    const catnip = this.admin.resource("catnip");
    const kittenCapacity = kittens.state.capacity ?? 0;
    if (catnip.state.amount > 0 && kittens.state.amount < kittenCapacity) {
      // grow pops as long as there's catnip and capacity for them
      if (society.stockpile < 0) {
        // if we had fractional starvation, void it
        society.stockpile = 0;
      }
      society.stockpile += dt * this.growthPerTick;
    } else if (catnip.state.amount == 0 && kittens.state.amount > 0) {
      // starve existing pops when catnip is 0
      if (society.stockpile > 0) {
        // if we had fractional growth, void it
        society.stockpile = 0;
      }
      society.stockpile += dt * this.starvationPerTick;
    } else {
      // otherwise, population is not going to be changing right now, reset state
      society.stockpile = 0;
    }
  }
}

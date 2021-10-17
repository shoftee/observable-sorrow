import { count } from "@/_utils/collections";
import { trunc } from "@/_utils/mathx";

import { SocietyEntity } from "../entity";

import { System } from ".";

export class PopulationSystem extends System {
  private readonly growthPerTick = 0.01;
  private readonly starvationPerTick = -0.2;

  update(): void {
    this.updatePops();
    this.updateStockpile();
  }

  private updatePops() {
    const society = this.admin.society();
    const state = society.state;
    const effectiveStockpile = trunc(state.stockpile);
    if (effectiveStockpile >= 1) {
      // A new pop has grown
      this.growPops(society, effectiveStockpile);
      state.stockpile -= effectiveStockpile;
    } else if (effectiveStockpile <= -1) {
      // A full pop has starved
      this.killPops(society, Math.abs(effectiveStockpile));
      state.stockpile -= effectiveStockpile;
    }

    const kittens = this.admin.resource("kittens");
    kittens.state.amount = society.state.totalPops;
  }

  private growPops(society: SocietyEntity, n: number): void {
    const pops = this.admin.pops();
    const grown = pops.grow(n);
    society.state.totalPops += grown.length;
    society.state.unemployedPops += grown.length;
  }

  private killPops(society: SocietyEntity, n: number): void {
    const pops = this.admin.pops();
    const killed = pops.kill(n);
    society.state.totalPops -= killed.length;

    const unemployedDeaths = count(killed, (p) => p.state.job === "none");
    society.state.unemployedPops -= unemployedDeaths;
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

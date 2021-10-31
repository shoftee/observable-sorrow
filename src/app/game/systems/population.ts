import { pluralLabel } from "@/app/state";
import { trunc } from "@/app/utils/mathx";

import { System } from ".";

export class PopulationSystem extends System {
  private readonly growthPerTick = 0.01;
  private readonly starvationPerTick = -0.2;

  update(): void {
    this.updatePops();
    this.updateStockpile();
  }

  private updatePops() {
    const stockpile = this.admin.stockpile("kitten-growth").state;
    const effectiveStockpile = trunc(stockpile.amount);
    if (effectiveStockpile >= 1) {
      // A new pop has grown
      const count = effectiveStockpile;
      this.admin.pops().grow(count);
      stockpile.amount -= count;

      this.kittensArrived(count);
    } else if (effectiveStockpile <= -1) {
      // A full pop has starved
      const count = Math.abs(effectiveStockpile);
      this.admin.pops().kill(count);
      stockpile.amount += count;

      this.kittensStarved(count);
    }

    const kittens = this.admin.resource("kittens").state;
    kittens.amount = this.admin.pops().size;
  }

  private kittensArrived(count: number) {
    const event = pluralLabel("population.kitten.arrived", count, { count });
    if (this.admin.pops().size > 10) {
      // Once past 10 pops, these messages are not so interesting.
      event.disposition = "ignore";
    }
    this.admin.history().push(event);
  }

  private kittensStarved(count: number) {
    const event = pluralLabel("population.kitten.starved", count, { count });
    this.admin.history().push(event);
  }

  private updateStockpile() {
    const dt = this.admin.time().ticks.delta;
    const kittens = this.admin.resource("kittens");
    const catnip = this.admin.resource("catnip");

    const stockpile = this.admin.stockpile("kitten-growth").state;
    const kittenCapacity = kittens.state.capacity ?? 0;
    if (catnip.state.amount > 0 && kittens.state.amount < kittenCapacity) {
      // grow pops as long as there's catnip and capacity for them
      if (stockpile.amount < 0) {
        // if we had fractional starvation, void it
        stockpile.amount = 0;
      }
      stockpile.amount += dt * this.growthPerTick;
    } else if (catnip.state.amount == 0 && kittens.state.amount > 0) {
      // starve existing pops when catnip is 0
      if (stockpile.amount > 0) {
        // if we had fractional growth, void it
        stockpile.amount = 0;
      }
      stockpile.amount += dt * this.starvationPerTick;
    } else {
      // otherwise, population is not going to be changing right now, reset state
      stockpile.amount = 0;
    }
  }
}

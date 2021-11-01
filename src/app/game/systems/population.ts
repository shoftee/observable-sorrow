import { watchSyncEffect } from "vue";

import { pluralLabel } from "@/app/state";
import { trunc } from "@/app/utils/mathx";

import { System } from ".";

export class PopulationSystem extends System {
  private readonly growthPerTick = 0.01;
  private readonly starvationPerTick = -0.2;

  init(): void {
    watchSyncEffect(() => {
      const kittens = this.admin.resource("kittens").state;
      kittens.amount = this.admin.pops().size;
    });
  }

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

    const stockpile = this.admin.stockpile("kitten-growth").state;

    const catnipAmount = this.admin.resource("catnip").state.amount;

    const kittens = this.admin.resource("kittens").state;
    const kittenAmount = kittens.amount;
    const kittenCapacity = kittens.capacity ?? 0;

    if (catnipAmount > 0 && kittenAmount < kittenCapacity) {
      // if catnip is nonzero and kittens aren't at capacity, they should grow

      // void any fractional starvation
      const oldAmount = Math.max(0, stockpile.amount);

      stockpile.amount = oldAmount + dt * this.growthPerTick;
    } else if (catnipAmount == 0 && kittenAmount > 0) {
      // if catnip is 0 and we have kittens, they should starve

      // void any fractional growth
      const oldAmount = Math.min(0, stockpile.amount);

      stockpile.amount = oldAmount + dt * this.starvationPerTick;
    } else {
      stockpile.amount = 0;
    }
  }
}

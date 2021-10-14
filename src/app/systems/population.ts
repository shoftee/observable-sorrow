import { System } from ".";

export class PopulationSystem extends System {
  update(): void {
    const dt = this.admin.time().ticks.delta;

    // apply effects to pops first
    const kittens = this.admin.resource("kittens");
    const society = this.admin.society().state;
    if (society.stockpile > 1) {
      // A new pop has grown
      society.totalPops += 1;
      society.stockpile -= 1;
    } else if (society.stockpile < -1) {
      // A full pop has starved
      society.totalPops -= 1;
      society.stockpile += 1;
    }

    society.unemployedPops = kittens.state.amount = society.totalPops;

    // calculate effects for next tick
    const catnip = this.admin.resource("catnip");
    const kittenCapacity = kittens.state.capacity ?? 0;
    if (kittens.state.amount < kittenCapacity && catnip.state.change > 0) {
      // only grow pops when catnip is increasing.
      society.delta = this.admin.effect("population.growth").get() ?? 0;

      if (society.stockpile < 0) {
        // if we had fractional starvation, void it.
        society.stockpile = 0;
      }

      society.stockpile += dt * society.delta;
    } else if (kittens.state.amount > 0 && catnip.state.amount == 0) {
      // when catnip is 0, pops begin starving.
      society.delta = this.admin.effect("population.starvation").get() ?? 0;

      if (society.stockpile > 0) {
        // if we had fractional growth, void it
        society.stockpile = 0;
      }

      society.stockpile -= dt * society.delta;
    } else {
      // otherwise, population is not going to be changing right now, reset state
      society.delta = 0;
      society.stockpile = 0;
    }
  }
}

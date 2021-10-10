import { System } from ".";

export class PopulationSystem extends System {
  update(): void {
    const dt = this.admin.time().ticks.delta;

    const catnip = this.admin.resource("catnip");
    const kittens = this.admin.resource("kittens");
    const population = this.admin.population().state;
    const kittenCapacity = kittens.state.capacity ?? 0;
    if (kittens.state.amount < kittenCapacity && catnip.state.change > 0) {
      // only grow pops when catnip is increasing.
      population.delta = this.admin.effect("population.growth").get() ?? 0;

      if (population.stockpile < 0) {
        // if we had fractional starvation, void it.
        population.stockpile = 0;
      }

      population.stockpile += dt * population.delta;
    } else if (kittens.state.amount > 0 && catnip.state.amount == 0) {
      // when catnip is 0, pops begin starving.
      population.delta = this.admin.effect("population.starvation").get() ?? 0;

      if (population.stockpile > 0) {
        // if we had fractional growth, void it
        population.stockpile = 0;
      }

      population.stockpile -= dt * population.delta;
    } else {
      // otherwise, population is not going to be changing right now, reset state
      population.delta = 0;
      population.stockpile = 0;
    }

    if (population.stockpile > 1) {
      // A new pop has grown
      this.admin.resource("kittens").delta.addDebit(1);
      population.stockpile -= 1;
    } else if (population.stockpile < -1) {
      // A full pop has starved
      this.admin.resource("kittens").delta.addCredit(1);
      population.stockpile += 1;
    }
  }
}

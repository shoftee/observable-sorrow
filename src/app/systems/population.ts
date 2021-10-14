import { System } from ".";

export class PopulationSystem extends System {
  private readonly growthPerTick = 0.01;
  private readonly starvationPerTick = -0.2;

  update(): void {
    const dt = this.admin.time().ticks.delta;

    // apply effects to pops first
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

    const kittens = this.admin.resource("kittens");
    society.unemployedPops = kittens.state.amount = society.totalPops;

    // calculate effects for next tick
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

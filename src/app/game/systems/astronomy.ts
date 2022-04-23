import { label, ResourceMap } from "@/app/state";
import { System } from ".";

export class AstronomySystem extends System {
  update(): void {
    const { ticks, days } = this.admin.time();

    const observe = this.admin.stockpile("observe-sky").state;
    if (observe.amount > 0) {
      const environment = this.admin.environment();
      if (environment.observedSky) {
        // clear observation
        environment.observedSky = false;
        observe.amount = 0;

        this.observedRareEvent();
      } else if (ticks.wholeTicks > 0) {
        // decrease existing counter on whole ticks only
        observe.amount--;
      }
    }

    if (days.wholeTicks > 0) {
      // new events only spawn once a day
      this.handleCelestialEvents();
    }
  }

  private handleCelestialEvents() {
    const scienceUnlocked = this.admin
      .boolean("unlock.section.science")
      .getOr(false);
    // these only occur after science is unlocked
    if (!scienceUnlocked) {
      return;
    }

    // rare event in the sky
    {
      // base chance is 0.25%, around once per game calendar year
      const chance = 1 / 400;
      const r = this.admin.prng().astronomy();
      if (r < chance) {
        this.admin.history().push(label("astronomy.rare-event"));

        const observe = this.admin.stockpile("observe-sky").state;
        observe.amount = 300; // 60 seconds
      }
    }

    // meteor fall
    if (this.admin.tech("mining").state.researched) {
      // base chance is 0.1%
      const chance = 1 / 1000;
      const r = this.admin.prng().astronomy();
      if (r < chance) {
        this.minedFallenMeteor();
      }
    }
  }

  private observedRareEvent() {
    // calculate reward
    const rewardAmount = this.admin
      .number("astronomy.rare-event.reward")
      .getOr(25);
    this.admin.transactions().enqueue({
      debits: ResourceMap.fromObject({ science: rewardAmount }),
      onFulfilled: (amounts) => {
        const scienceAmount = amounts.get("science") ?? 0;
        if (scienceAmount > 0) {
          this.admin.history().push(
            label("astronomy.observed-sky-reward.gained", {
              scienceAmount,
            }),
          );
        } else {
          this.admin
            .history()
            .push(label("astronomy.observed-sky-reward.capped"));
        }
      },
    });
  }

  private minedFallenMeteor() {
    const mineralsRatio = this.admin.number("minerals.ratio").getOr(0);
    const rewardAmount = 50 + 25 * mineralsRatio;
    this.admin.transactions().enqueue({
      debits: ResourceMap.fromObject({ minerals: rewardAmount }),
      onFulfilled: (fulfillment) => {
        const mineralsAmount = fulfillment.get("minerals") ?? 0;
        if (mineralsAmount > 0) {
          this.admin.history().push(
            label("astronomy.fallen-meteor-reward.gained-minerals", {
              mineralsAmount,
            }),
          );
        } else {
          this.admin
            .history()
            .push(label("astronomy.fallen-meteor-reward.capped"));
        }
      },
    });
  }
}

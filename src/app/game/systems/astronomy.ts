import { label } from "@/app/state";
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

        // calculate reward
        const reward = this.admin.number("astronomy.rare-event.reward").state;
        const amount = reward.value ?? 25;
        this.admin.resource("science").delta.addDebit(amount);

        // show in history log
        this.gainedScience(amount);
      } else if (ticks.wholeTicks > 0) {
        // decrease existing counter on whole ticks only
        observe.amount--;
      }
    }

    if (days.wholeTicks > 0) {
      // new events only spawn once a day
      this.handleRareEvent();
    }
  }

  private gainedScience(amount: number) {
    this.admin.history().push(label("astronomy.science-reward", { amount }));
  }

  private handleRareEvent() {
    const unlocked = this.admin.boolean("unlock.section.science").state;
    if (unlocked.value !== true) {
      // these only occur after science has been unlocked
      return;
    }

    const chance = 1 / 400; // ~ once per game calendar year
    const r = this.admin.prng().astronomy();
    if (r < chance) {
      this.admin.history().push(label("astronomy.rare-event"));

      const observe = this.admin.stockpile("observe-sky").state;
      observe.amount = 300; // 60 seconds
    }
  }
}

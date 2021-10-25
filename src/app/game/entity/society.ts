import { reactive } from "vue";

import { SocietyState } from "@/app/state";
import { SaveState } from "@/app/store";

import { Entity, Persisted, Watched, Watcher } from ".";

export class SocietyEntity
  extends Entity<"society">
  implements Watched, Persisted
{
  readonly state: SocietyState;

  constructor() {
    super("society");

    this.state = reactive({
      stockpile: 0,
      totalPops: 0,
      idlePops: 0,
    });
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }

  loadState(save: SaveState): void {
    const society = save.society;
    if (society?.stockpile !== undefined) {
      this.state.stockpile = society.stockpile;
    }
  }

  saveState(state: SaveState): void {
    state.society = {
      stockpile: this.state.stockpile,
    };
  }
}

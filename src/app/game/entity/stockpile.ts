import { reactive } from "vue";

import { StockpileId } from "@/app/interfaces";
import { StockpileState } from "@/app/state";
import { SaveState } from "@/app/store";

import { Entity, EntityPool, Persisted, Watched, Watcher } from ".";

type StockpileStore = NonNullable<SaveState["stockpiles"]>[StockpileId];

export class StockpileEntity extends Entity<StockpileId> implements Watched {
  readonly state: StockpileState;

  constructor(id: StockpileId) {
    super(id);

    this.state = reactive<StockpileState>({ amount: 0 });
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }

  load(store: StockpileStore): void {
    if (store) {
      this.state.amount = store.amount;
    }
  }

  save(): StockpileStore {
    return {
      amount: this.state.amount,
    };
  }
}

export class StockpilesPool
  extends EntityPool<StockpileId, StockpileEntity>
  implements Persisted
{
  constructor(watcher: Watcher) {
    super("stockpiles", watcher);
    this.add(new StockpileEntity("kitten-growth"));
    this.add(new StockpileEntity("observe-sky"));
  }

  loadState(state: SaveState): void {
    const stored = state.stockpiles;
    if (stored !== undefined) {
      for (const stockpile of this.enumerate()) {
        stockpile.load(stored[stockpile.id]);
      }
    }
  }

  saveState(state: SaveState): void {
    state.stockpiles = {};
    for (const stockpile of this.enumerate()) {
      state.stockpiles[stockpile.id] = stockpile.save();
    }
  }
}

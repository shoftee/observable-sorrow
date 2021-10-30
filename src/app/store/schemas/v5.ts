import { StockpileId } from "@/app/interfaces";
import { DBSchema, IDBPDatabase } from "idb";
import { LatestSchema, UpgradeTransaction } from ".";

import { AtomicState, DeepPartial } from "..";
import { OsSchemaV4 } from "./v4";

type LastStateSchema = OsSchemaV4["saves"]["value"]["state"];

type Additions = {
  stockpiles: {
    [S in StockpileId]?: AtomicState<{
      amount: number;
    }>;
  };
};

export interface OsSchemaV5 extends DBSchema {
  general: {
    key: "general";
    value: {
      currentSlot?: number;
    };
  };
  saves: {
    key: number;
    value: {
      version: number;
      state: Omit<LastStateSchema, "society"> & DeepPartial<Additions>;
    };
  };
}

export async function migrateV5(
  _database: IDBPDatabase<LatestSchema>,
  transaction: UpgradeTransaction,
): Promise<void> {
  const tx = transaction as unknown as UpgradeTransaction<OsSchemaV5>;
  const saves = tx.objectStore("saves");
  let cursor = await saves.openCursor();
  while (cursor) {
    const save = cursor.value;

    const { state } = save;
    // moved society stockpile to separate section
    const society = (state as LastStateSchema).society;
    if (society) {
      state.stockpiles = {
        "kitten-growth": { amount: society.stockpile },
      };
    }
    // removed society state
    delete (state as LastStateSchema).society;

    await cursor.update(save);
    cursor = await cursor.continue();
  }
}

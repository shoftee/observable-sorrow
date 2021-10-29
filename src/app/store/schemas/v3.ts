import { DBSchema, IDBPDatabase } from "idb";

import { BuildingId } from "@/app/interfaces";

import { AtomicState, DeepPartial } from "..";
import { OsSchemaV2 } from "./v2";
import { LatestSchema, UpgradeTransaction } from ".";

type LastStateSchema = OsSchemaV2["saves"]["value"]["state"];

type Additions = {
  buildings: {
    [B in BuildingId]?: AtomicState<{
      unlocked: boolean;
    }>;
  };
};

export interface OsSchemaV3 extends DBSchema {
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
      state: LastStateSchema & DeepPartial<Additions>;
    };
  };
}

export async function migrateV3(
  _database: IDBPDatabase<LatestSchema>,
  _transaction: UpgradeTransaction,
): Promise<void> {
  const tx = _transaction as unknown as UpgradeTransaction<OsSchemaV3>;
  const saves = tx.objectStore("saves");
  let cursor = await saves.openCursor();
  while (cursor) {
    const save = cursor.value;
    const buildings = save.state.buildings ?? {};
    for (const building of Object.values(buildings)) {
      // added unlocked state for buildings
      building.unlocked = building.level > 0;
    }

    await cursor.update(save);
    cursor = await cursor.continue();
  }
}

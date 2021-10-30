import { DBSchema, IDBPDatabase } from "idb";

import { ResourceId } from "@/app/interfaces";

import { AtomicState, DeepPartial } from "..";
import { LatestSchema, UpgradeTransaction } from ".";
import { OsSchemaV3 } from "./v3";

type LastStateSchema = OsSchemaV3["saves"]["value"]["state"];

type Additions = {
  resources: {
    [R in ResourceId]?: AtomicState<{
      unlocked: boolean;
    }>;
  };
};

export interface OsSchemaV4 extends DBSchema {
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

export async function migrateV4(
  _database: IDBPDatabase<LatestSchema>,
  transaction: UpgradeTransaction,
): Promise<void> {
  const tx = transaction as unknown as UpgradeTransaction<OsSchemaV4>;
  const saves = tx.objectStore("saves");
  let cursor = await saves.openCursor();
  while (cursor) {
    const save = cursor.value;

    const resources = save.state.resources;
    if (resources) {
      for (const resource of Object.values(resources)) {
        // defined unlocked state
        // NOTE: this is only a heuristic...
        resource.unlocked = resource.amount > 0;
      }
    }

    await cursor.update(save);
    cursor = await cursor.continue();
  }
}

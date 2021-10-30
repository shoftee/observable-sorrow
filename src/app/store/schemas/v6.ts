import { DBSchema, IDBPDatabase } from "idb";
import { LatestSchema, UpgradeTransaction } from ".";

import { DeepPartial } from "..";
import { OsSchemaV5 } from "./v5";

type LastStateSchema = OsSchemaV5["saves"]["value"]["state"];

type Additions = {
  seeds: {
    astronomy: number;
  };
};

export interface OsSchemaV6 extends DBSchema {
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

export async function migrateV6(
  _database: IDBPDatabase<LatestSchema>,
  _transaction: UpgradeTransaction,
): Promise<void> {
  // added astronomy seed, no custom migration needed
}

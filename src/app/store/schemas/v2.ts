import { DBSchema, IDBPDatabase } from "idb";

import { TechId } from "@/app/interfaces";

import { AtomicState, DeepPartial } from "..";
import { OsSchemaV1 } from "./v1";
import { LatestSchema, UpgradeTransaction } from ".";

type LastStateSchema = OsSchemaV1["saves"]["value"]["state"];

type Additions = {
  science: {
    [T in TechId]?: AtomicState<{
      researched: boolean;
    }>;
  };
};

export interface OsSchemaV2 extends DBSchema {
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

export async function migrateV2(
  _database: IDBPDatabase<LatestSchema>,
  _transaction: UpgradeTransaction,
): Promise<void> {
  // added science, no need for explicit migration
  return;
}

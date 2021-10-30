import { IDBPDatabase, IDBPTransaction, StoreNames } from "idb";

import { migrateV1 } from "./v1";
import { migrateV2 } from "./v2";
import { migrateV3 } from "./v3";
import { migrateV4 } from "./v4";
import { migrateV5 } from "./v5";
import { migrateV6, OsSchemaV6 } from "./v6";

export const DatabaseName = "os-data";
export const LatestVersion = 6;
export type LatestSchema = OsSchemaV6;
export type UpgradeTransaction<TSchema = LatestSchema> = IDBPTransaction<
  TSchema,
  StoreNames<TSchema>[],
  "versionchange"
>;

type Migration = {
  version: number;
  run: (
    database: IDBPDatabase<LatestSchema>,
    transaction: UpgradeTransaction,
  ) => Promise<void>;
};

const migrations: Migration[] = [
  { version: 1, run: migrateV1 },
  { version: 2, run: migrateV2 },
  { version: 3, run: migrateV3 },
  { version: 4, run: migrateV4 },
  { version: 5, run: migrateV5 },
  { version: 6, run: migrateV6 },
];

export async function migrate(
  db: IDBPDatabase<LatestSchema>,
  oldVersion: number,
  newVersion: number | null,
  transaction: UpgradeTransaction,
): Promise<void> {
  let range = migrations.filter((m) => oldVersion < m.version);
  if (newVersion !== null) {
    range = range.filter((m) => m.version <= newVersion);
  }
  for (const migration of range) {
    await migration.run(db, transaction);
  }
}

import { IDBPDatabase, IDBPTransaction, StoreNames } from "idb";

import { migrateV1 } from "./v1";
import { migrateV2 } from "./v2";
import { migrateV3 } from "./v3";
import { migrateV4, OsSchemaV4 } from "./v4";

export const DatabaseName = "os-data";
export const LatestVersion = 4;
export type LatestSchema = OsSchemaV4;
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

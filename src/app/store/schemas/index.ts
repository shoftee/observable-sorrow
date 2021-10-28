import { IDBPDatabase, IDBPTransaction, StoreNames } from "idb";

import { migrateV1 } from "./v1";
import { migrateV2, OsSchemaV2 } from "./v2";

export const DatabaseName = "os-data";
export const LatestVersion = 2;
export type LatestSchema = OsSchemaV2;
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

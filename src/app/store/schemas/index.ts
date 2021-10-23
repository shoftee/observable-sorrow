import { IDBPDatabase } from "idb";
import { OsSchemaV1 } from "./v1";
import { OsSchemaV2 } from "./v2";

export const DatabaseName = "os-data";
export const LatestVersion = 2;
export type LatestSchema = OsSchemaV2;

export async function migrate(
  db: IDBPDatabase<LatestSchema>,
  oldVersion: number,
): Promise<void> {
  if (oldVersion < 1) {
    // initial version
    const v0 = db as unknown as IDBPDatabase<OsSchemaV1>;
    v0.createObjectStore("general");
    v0.createObjectStore("saves", { autoIncrement: true });
  }
  if (oldVersion < 2) {
    // added science, no need for explicit migration
  }
}

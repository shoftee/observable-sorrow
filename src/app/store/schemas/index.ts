import { IDBPDatabase } from "idb";
import { OsSchemaV1 } from "./v1";

export const DatabaseName = "os-data";
export const LatestVersion = 1;
export type LatestSchema = OsSchemaV1;

export async function migrate(
  db: IDBPDatabase<LatestSchema>,
  oldVersion: number,
): Promise<void> {
  if (oldVersion < 1) {
    // initial version
    const v0 = db as unknown as IDBPDatabase<unknown>;
    v0.createObjectStore("general");
    v0.createObjectStore("saves", { autoIncrement: true });
  }
}

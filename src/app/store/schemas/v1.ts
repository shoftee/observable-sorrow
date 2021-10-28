import { DBSchema, IDBPDatabase } from "idb";

import {
  ResourceId,
  BuildingId,
  JobId,
  SeasonId,
  WeatherId,
} from "@/app/interfaces";

import { AtomicState, DeepPartial } from "..";
import { LatestSchema, UpgradeTransaction } from ".";

export interface OsSchemaV1 extends DBSchema {
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
      state: DeepPartial<{
        buildings: {
          [B in BuildingId]?: AtomicState<{
            level: number;
          }>;
        };
        environment: AtomicState<{
          year: number;
          season: SeasonId;
          day: number;
          weather: WeatherId;
        }>;
        pops: AtomicState<{
          name: string;
          job?: JobId;
        }>[];
        player: AtomicState<{
          dev: { timeAcceleration: number; gatherCatnip: number } | undefined;
        }>;
        resources: {
          [R in ResourceId]?: AtomicState<{
            amount: number;
          }>;
        };
        time: {
          ticks: number;
          days: number;
        };
        seeds: {
          environment: number;
        };
        society: {
          stockpile: number;
        };
      }>;
    };
  };
}

export async function migrateV1(
  database: IDBPDatabase<LatestSchema>,
  _transaction: UpgradeTransaction,
): Promise<void> {
  // initial version
  const v1 = database as unknown as IDBPDatabase<OsSchemaV1>;
  v1.createObjectStore("general");
  v1.createObjectStore("saves", { autoIncrement: true });
}

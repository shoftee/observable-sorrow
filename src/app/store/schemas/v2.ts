import { DBSchema } from "idb";

import {
  ResourceId,
  BuildingId,
  JobId,
  SeasonId,
  WeatherId,
  TechnologyId,
} from "@/app/interfaces";

import { AtomicState, DeepPartial } from "..";

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
        science: {
          [T in TechnologyId]?: AtomicState<{
            researched: boolean;
          }>;
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

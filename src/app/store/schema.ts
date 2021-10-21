import { DBSchema } from "idb";

import {
  BuildingId,
  JobId,
  ResourceId,
  SeasonId,
  WeatherId,
} from "../interfaces";

type AtomicState<T> = T;

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends AtomicState<T[K]> ? T[K] : DeepPartial<T[K]>;
};

export type GameState = {
  seeds: {
    environment: number;
  };
  time: {
    ticks: number;
    days: number;
  };
  society: {
    stockpile: number;
  };
  resources: {
    [R in ResourceId]?: AtomicState<{
      amount: number;
    }>;
  };
  buildings: {
    [B in BuildingId]?: AtomicState<{
      level: number;
    }>;
  };
  pops: AtomicState<{
    name: string;
    job?: JobId;
  }>[];
  environment: AtomicState<{
    year: number;
    season: SeasonId;
    day: number;
    weather: WeatherId;
  }>;
  player: AtomicState<{
    dev: { timeAcceleration: number; gatherCatnip: number } | undefined;
  }>;
};

export type SaveState = DeepPartial<GameState>;

export interface OsSchema extends DBSchema {
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
      state: SaveState;
    };
  };
}

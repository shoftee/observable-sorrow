import { DBSchema } from "idb";

import { TechnologyId } from "@/app/interfaces";

import { AtomicState, DeepPartial } from "..";
import { OsSchemaV1 } from "./v1";

type LastStateSchema = OsSchemaV1["saves"]["value"]["state"];

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
      state: LastStateSchema &
        DeepPartial<{
          science: {
            [T in TechnologyId]?: AtomicState<{
              researched: boolean;
            }>;
          };
        }>;
    };
  };
}

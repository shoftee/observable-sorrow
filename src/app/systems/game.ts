import { MetadataPool } from "../_metadata/pool";
import { IEnvironmentManager } from "./environment";
import { ILimitsManager } from "./limits";
import { IResourceManager } from "./resources";
import { ITimeManager } from "./time";

interface IGame {
  readonly time: ITimeManager;
  readonly environment: IEnvironmentManager;
  readonly resources: IResourceManager;
  readonly limits: ILimitsManager;
  readonly metadata: MetadataPool;
}

interface IRegisterInGame {
  register(game: IGame): void;
}

interface IUpdated {
  update(tick: number): void;
}

export { IGame, IRegisterInGame, IUpdated };

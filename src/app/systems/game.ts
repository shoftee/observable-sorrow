import { MetadataPool } from "../_metadata/pool";
import { IEnvironmentEntity } from "../environment";
import { IResourceManager } from "./resources";

interface IGame {
  readonly environment: IEnvironmentEntity;
  readonly resources: IResourceManager;
  readonly metadata: MetadataPool;
}

interface IRegisterInGame {
  register(game: IGame): void;
}

export { IGame, IRegisterInGame };

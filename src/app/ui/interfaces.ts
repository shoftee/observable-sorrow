import { Ref } from "vue";
import { IEnvironmentState } from "../entities/environment";
import { IResourceState } from "../entities/resource";
import { IEnvironmentMetadata } from "../_metadata/environment";
import { ResourceId } from "../_metadata/resources";

interface IUiGame {
  readonly commands: ICommandManager;
  readonly states: IStateManager;

  start(): void;
}

interface ICommandManager {
  gatherCatnip(): void;
}

interface IResourceAccessor {
  all(): Ref<IResourceState>[];
  get(id: ResourceId): Ref<IResourceState>;
}

interface IEnvironmentAccessor {
  get(): Ref<IEnvironmentState>;
  meta(): IEnvironmentMetadata;
}

interface IStateManager {
  resources(): IResourceAccessor;
  environment(): IEnvironmentAccessor;
}

export {
  IUiGame,
  ICommandManager,
  IResourceAccessor,
  IEnvironmentAccessor,
  IStateManager,
};

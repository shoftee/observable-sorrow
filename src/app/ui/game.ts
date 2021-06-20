import { ICommandManager } from "./commands";
import { IEnvironmentPresenter } from "./environment";
import { IStateManager } from "./states";
import { ITextManager } from "./text";

interface IUiGame {
  readonly environment: IEnvironmentPresenter;
  readonly commands: ICommandManager;
  readonly states: IStateManager;
  readonly text: ITextManager;

  start(): void;
  stop(): void;
  forceUpdate(): void;
}

export { IUiGame };

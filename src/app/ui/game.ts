import { ICommandManager } from "./commands";
import { IStateManager } from "./states";
import { ITextManager } from "./text";

interface IUiGame {
  readonly commands: ICommandManager;
  readonly states: IStateManager;
  readonly text: ITextManager;

  start(): void;
}

export { IUiGame };

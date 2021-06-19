import { MetadataPool } from "../_metadata/pool";
import { LimitsManager } from "../limits/manager";
import { EnvironmentManager } from "../environment/manager";
import { ResourceManager } from "../resources/manager";
import { TimeManager } from "../time/manager";

import { StateManager } from "../ui/states";
import { CommandManager } from "../ui/commands";
import { TextManager } from "../ui/text";
import { IGame, IRegisterInGame } from "../systems/game";

class Game implements IGame {
  readonly metadata: MetadataPool = new MetadataPool();
  readonly time: TimeManager = new TimeManager();
  readonly environment: EnvironmentManager = new EnvironmentManager();
  readonly resources: ResourceManager = new ResourceManager();
  readonly limits: LimitsManager = new LimitsManager();

  readonly commands: CommandManager = new CommandManager();
  readonly states: StateManager = new StateManager();
  readonly text: TextManager = new TextManager();

  constructor() {
    this.register(this.environment);
    this.register(this.resources);

    this.register(this.commands);
    this.register(this.states);
    this.register(this.text);
  }

  private register(target: IRegisterInGame) {
    target.register(this);
  }

  start(): void {
    this.update(0);
    this.time.every().subscribe({
      next: (tick) => this.update(tick),
    });
    this.time.start();
  }

  private update(tick: number): void {
    this.resources.update(tick);
    //
  }
}

export { Game };

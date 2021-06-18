import { LimitsManager } from "../limits/manager";
import { EnvironmentManager } from "../environment/manager";
import { ResourceManager } from "../resources/manager";
import { TimeManager } from "../time/manager";

import { StateManager } from "../ui/states";
import { CommandManager } from "../ui/commands";
import { IGame, IRegisterInGame } from "../systems/game";
import { MetadataPool } from "../_metadata/pool";

class Game implements IGame {
  readonly time: TimeManager = new TimeManager();
  readonly environment: EnvironmentManager = new EnvironmentManager();
  readonly resources: ResourceManager = new ResourceManager();
  readonly limits: LimitsManager = new LimitsManager();
  readonly metadata: MetadataPool = new MetadataPool();

  readonly commands: CommandManager = new CommandManager();
  readonly states: StateManager = new StateManager();

  constructor() {
    this.register(this.environment);
    this.register(this.resources);

    this.register(this.commands);
    this.register(this.states);
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

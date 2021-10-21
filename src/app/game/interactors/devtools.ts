import { IDevToolsInteractor } from "@/app/interfaces";

import { EntityAdmin, PlayerEntity } from "../entity";

export class DevToolsInteractor implements IDevToolsInteractor {
  constructor(private readonly admin: EntityAdmin) {}

  private get player(): PlayerEntity {
    return this.admin.player();
  }

  turnDevToolsOn(): void {
    if (this.player.state.dev) return;
    this.player.state.dev = true;
  }

  turnDevToolsOff(): void {
    if (!this.player.state.dev) return;
    this.player.state.dev = false;
    this.player.state.gatherCatnip = 1;
    this.player.state.timeAcceleration = 1;
  }

  setGatherCatnip(amount: number): void {
    if (!this.player.state.dev) {
      throw new Error("devtools are off");
    }
    this.player.state.gatherCatnip = amount;
  }

  setTimeAcceleration(factor: number): void {
    if (!this.player.state.dev) {
      throw new Error("devtools are off");
    }
    this.player.state.timeAcceleration = factor;
  }
}

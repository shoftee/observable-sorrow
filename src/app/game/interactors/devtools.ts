import { IDevToolsInteractor } from "@/app/interfaces";
import { PlayerState } from "@/app/state";

import { EntityAdmin } from "../entity";

export class DevToolsInteractor implements IDevToolsInteractor {
  constructor(private readonly admin: EntityAdmin) {}

  private get player(): PlayerState {
    return this.admin.player().state;
  }

  turnDevToolsOn(): void {
    if (this.player.dev) return;
    this.player.dev = true;
  }

  turnDevToolsOff(): void {
    const player = this.player;
    if (!player.dev) return;
    player.dev = false;
    player.gatherCatnip = 1;
    player.timeAcceleration = 0;
  }

  setGatherCatnip(amount: number): void {
    const player = this.player;
    if (!player.dev) {
      throw new Error("devtools are off");
    }
    player.gatherCatnip = amount;
  }

  setTimeAcceleration(factor: number): void {
    const player = this.player;
    if (!player.dev) {
      throw new Error("devtools are off");
    }
    player.timeAcceleration = factor;
  }
}

import { IDevToolsInteractor } from "@/_interfaces";
import { PlayerState } from "@/_state";

import { EntityAdmin, PlayerEntity } from "../entity";

export class DevToolsInteractor implements IDevToolsInteractor {
  private readonly offOptions = new PlayerState();
  private readonly onOptions = new PlayerState();

  private on = false;

  constructor(private readonly admin: EntityAdmin) {}

  private get player(): PlayerEntity {
    return this.admin.player();
  }

  turnDevToolsOn(): void {
    if (this.on) return;
    Object.assign(this.offOptions, this.player.state);
    Object.assign(this.player.state, this.onOptions);
    this.on = true;
  }

  turnDevToolsOff(): void {
    if (!this.on) return;
    Object.assign(this.onOptions, this.player.state);
    Object.assign(this.player.state, this.offOptions);
    this.on = false;
  }

  setGatherCatnip(amount: number): void {
    this.player.state.gatherCatnip = amount;
  }

  setTimeAcceleration(factor: number): void {
    this.player.state.timeAcceleration = factor;
  }
}

import { IDevToolsInteractor } from "@/app/interfaces";
import { PlayerState } from "@/app/state";

import { EntityAdmin, PlayerEntity } from "../entity";

export class DevToolsInteractor implements IDevToolsInteractor {
  private readonly offOptions: PlayerState;
  private readonly onOptions: PlayerState;

  private on = false;

  constructor(private readonly admin: EntityAdmin) {
    this.offOptions = { gatherCatnip: 1, timeAcceleration: 1 };
    this.onOptions = { gatherCatnip: 1, timeAcceleration: 1 };
  }

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

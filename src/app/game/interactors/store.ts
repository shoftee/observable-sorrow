import { IStoreInteractor } from "@/app/interfaces";
import {
  loadOrInitGeneral,
  loadSlot,
  newSlot,
  saveSlot,
  SaveSlot,
  setCurrentSlot,
} from "@/app/store/db";

import { EntityAdmin } from "../entity";

export class StoreInteractor implements IStoreInteractor {
  private version;

  constructor(private readonly admin: EntityAdmin) {
    this.version = 0;
  }

  async load(): Promise<void> {
    const general = await loadOrInitGeneral();
    if (!general.currentSlot) {
      general.currentSlot = await newSlot();
    }

    const slotData = await loadSlot(general.currentSlot);
    await setCurrentSlot(general.currentSlot);
    this.version = slotData.version;
    this.admin.loadState(slotData.state);
  }

  async save(): Promise<void> {
    const slot: SaveSlot = {
      version: this.version,
      state: {},
    };
    this.admin.saveState(slot.state);

    const general = await loadOrInitGeneral();
    if (general.currentSlot === undefined) {
      throw new Error("Save slot not set.");
    }

    await saveSlot(general.currentSlot, slot);
    this.version = slot.version;
  }
}

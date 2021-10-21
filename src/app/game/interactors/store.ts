import { IStoreInteractor } from "@/app/interfaces";
import { loadOrInitGeneral, saveSlot, SaveSlot } from "@/app/store/db";
import { EntityAdmin } from "../entity";

export class StoreInteractor implements IStoreInteractor {
  private version;

  constructor(private readonly admin: EntityAdmin) {
    this.version = 0;
  }

  load(slot: SaveSlot): void {
    this.version = slot.version;
    this.admin.loadState(slot.state);
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

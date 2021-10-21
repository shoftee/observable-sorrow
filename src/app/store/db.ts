import { deleteDB, openDB, StoreValue } from "idb";

import { OsSchema } from "./schema";

export class NotInitializedError extends Error {
  constructor() {
    super(`database not initialized`);
  }
}

export class SaveSlotDoesNotExistError extends Error {
  constructor(readonly id: number) {
    super(`save slot ${id} does not exist`);
  }
}

export class SaveSlotVersionMismatchError extends Error {
  constructor(
    readonly id: number,
    readonly expected: number,
    readonly actual: number,
  ) {
    super(
      `expected save slot ${id} to have version ${expected} but found ${actual} instead`,
    );
  }
}

function openStore() {
  return openDB<OsSchema>("game-data", 1, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore("general");
        db.put("general", { currentSlot: undefined }, "general");

        db.createObjectStore("saves", { autoIncrement: true });
      }
    },
  });
}

export type General = StoreValue<OsSchema, "general">;
export type SaveSlot = StoreValue<OsSchema, "saves">;

/** Creates a new save slot.
 * @returns the identifier of the new slot.
 */
export async function newSlot(): Promise<number> {
  const db = await openStore();

  const tx = db.transaction("saves", "readwrite");
  const id = await tx.store.add({
    version: 1,
    state: {},
  });

  await tx.done;

  return id;
}

/** Loads the general configuration, or initializes it if it's not present. */
export async function loadOrInitGeneral(): Promise<General> {
  const db = await openStore();

  const tx = db.transaction("general", "readwrite");
  let general = await tx.store.get("general");
  if (general === undefined) {
    general = {};
    await tx.store.put(general, "general");
  }

  await tx.done;

  return general;
}

/** Saves the general configuration.
 * @throws NotInitializedError
 */
export async function setCurrentSlot(currentSlot: number): Promise<void> {
  const db = await openStore();

  const tx = db.transaction("general", "readwrite");
  const general = await tx.store.get("general");
  if (general === undefined) {
    throw new NotInitializedError();
  }

  general.currentSlot = currentSlot;
  await tx.store.put(general, "general");

  await tx.done;
}

/** Loads the specified save slot.
 * @param id the identifier of the save slot to load
 * @throws SaveSlotDoesNotExistError
 */
export async function loadSlot(id: number): Promise<SaveSlot> {
  const db = await openStore();

  const state = await db.get("saves", id);
  if (!state) {
    throw new SaveSlotDoesNotExistError(id);
  }
  return state;
}

/** Updates the data in a save slot.
 * @param id the identifier of the save slot to update.
 * @param state the new save state to persist
 * @throws SaveSlotDoesNotExistError
 * @throws SaveSlotVersionMismatchError
 */
export async function saveSlot(id: number, state: SaveSlot): Promise<void> {
  const db = await openStore();

  const tx = db.transaction("saves", "readwrite", { durability: "strict" });
  const current = await tx.store.get(id);
  if (!current) {
    throw new SaveSlotDoesNotExistError(id);
  }
  if (current.version !== state.version) {
    throw new SaveSlotVersionMismatchError(id, state.version, current.version);
  }

  state.version++;
  tx.store.put(state, id);

  await tx.done;
}

/** Deletes the specified save slot
 * @param id the save slot to delete
 */
export async function wipeSlot(id: number): Promise<void> {
  const db = await openStore();

  const tx = db.transaction("saves", "readwrite");
  await tx.store.delete(id);

  await tx.done;
}

/** Deletes all save slots. */
export async function wipeAllSlots(): Promise<void> {
  await deleteDB("game-data", {
    blocked() {
      console.log("could not delete game database");
    },
  });
}

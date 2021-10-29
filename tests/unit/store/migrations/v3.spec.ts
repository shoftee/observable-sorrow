import { SaveSlot } from "@/app/store/db";
import { UpgradeTransaction } from "@/app/store/schemas";
import { migrateV3 } from "@/app/store/schemas/v3";
import { expect } from "chai";

describe("migrateV3", () => {
  it("should fill unlocked field for buildings", async () => {
    await migrateV3(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      null!,
      mockCursor({
        load() {
          return {
            version: 1,
            state: {
              buildings: { "catnip-field": { level: 1 }, hut: { level: 0 } },
            },
          } as SaveSlot;
        },
        save(save: SaveSlot) {
          const catnipField = (save.state.buildings ?? {})["catnip-field"];
          expect(catnipField?.level).to.equal(1);
          expect(catnipField?.unlocked).to.be.true;

          const hut = (save.state.buildings ?? {})["hut"];
          expect(hut?.level).to.equal(0);
          expect(hut?.unlocked).to.be.false;
        },
      }),
    );
  });
});

function asPromise<T>(value: T): Promise<T> {
  return new Promise((resolve) => resolve(value));
}

function mockCursor(handlers: {
  load(): SaveSlot;
  save(state: SaveSlot): void;
}) {
  return {
    objectStore() {
      return {
        openCursor() {
          return asPromise({
            get value() {
              return handlers.load();
            },
            continue() {
              return asPromise(undefined);
            },
            update(s: SaveSlot) {
              handlers.save(s);
              return asPromise(undefined);
            },
          });
        },
      };
    },
  } as unknown as UpgradeTransaction;
}

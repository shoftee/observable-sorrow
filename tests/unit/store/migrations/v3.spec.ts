import { SaveSlot } from "@/app/store/db";
import { UpgradeTransaction } from "@/app/store/schemas";
import { migrateV3 } from "@/app/store/schemas/v3";
import { expect } from "chai";

describe("migrateV3", () => {
  it("should fill unlocked field for buildings", async () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await migrateV3(null!, {
      objectStore: () => ({
        getAll() {
          return asPromise([
            {
              state: {
                buildings: { "catnip-field": { level: 1 }, hut: { level: 0 } },
              },
            },
          ]);
        },
        put(save: SaveSlot) {
          const catnipField = (save.state.buildings ?? {})["catnip-field"];
          expect(catnipField?.level).to.equal(1);
          expect(catnipField?.unlocked).to.be.true;
          const hut = (save.state.buildings ?? {})["hut"];
          expect(hut?.level).to.equal(0);
          expect(hut?.unlocked).to.be.false;
        },
      }),
    } as unknown as UpgradeTransaction);
  });
});

function asPromise<T>(value: T): Promise<T> {
  return new Promise((resolve) => resolve(value));
}

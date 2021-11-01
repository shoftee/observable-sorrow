import { expect } from "chai";

import { SaveSlot } from "@/app/store/db";
import { migrateV4 } from "@/app/store/schemas/v4";

import { mockCursor } from "./utils";

describe("migrateV4", () => {
  it("should fill unlocked field for resources", async () => {
    await migrateV4(
      null!,
      mockCursor({
        load() {
          return {
            version: 1,
            state: {
              resources: {
                catnip: { amount: 100 },
                wood: { amount: 0 },
              },
            },
          } as SaveSlot;
        },
        save(save: SaveSlot) {
          const resources = save.state.resources ?? {};

          const catnip = resources["catnip"];
          expect(catnip?.amount).to.equal(100);
          expect(catnip?.unlocked).to.be.true;

          const wood = resources["wood"];
          expect(wood?.amount).to.equal(0);
          expect(wood?.unlocked).to.be.false;
        },
      }),
    );
  });
});

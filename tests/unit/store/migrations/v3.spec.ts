import { expect } from "chai";

import { SaveSlot } from "@/app/store/db";
import { migrateV3 } from "@/app/store/schemas/v3";

import { mockCursor } from "./utils";

describe("migrateV3", () => {
  it("should fill unlocked field for buildings", async () => {
    await migrateV3(
      null!,
      mockCursor({
        load() {
          return {
            version: 1,
            state: {
              buildings: {
                "catnip-field": { level: 1 },
                hut: { level: 0 },
              },
            },
          } as SaveSlot;
        },
        save(save: SaveSlot) {
          const buildings = save.state.buildings ?? {};

          const catnipField = buildings["catnip-field"];
          expect(catnipField?.level).to.equal(1);
          expect(catnipField?.unlocked).to.be.true;

          const hut = buildings["hut"];
          expect(hut?.level).to.equal(0);
          expect(hut?.unlocked).to.be.false;
        },
      }),
    );
  });
});

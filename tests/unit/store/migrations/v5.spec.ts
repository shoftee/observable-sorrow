import { expect } from "chai";

import { SaveSlot } from "@/app/store/db";
import { OsSchemaV4 } from "@/app/store/schemas/v4";
import { migrateV5 } from "@/app/store/schemas/v5";

import { mockCursor } from "./utils";

describe("migrateV5", () => {
  it("should move stockpile value to new section", async () => {
    await migrateV5(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      null!,
      mockCursor({
        load() {
          return {
            version: 1,
            state: { society: { stockpile: 0.5 } },
          } as SaveSlot;
        },
        save(save: SaveSlot) {
          expect(save.state.stockpiles?.["kitten-growth"]?.amount).to.equal(
            0.5,
          );
          const oldSave = save as OsSchemaV4["saves"]["value"];
          expect(oldSave.state).to.not.have.own.property("society");
        },
      }),
    );
  });
});

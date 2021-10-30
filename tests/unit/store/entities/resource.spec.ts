import { expect } from "chai";

import { ResourceEntity } from "@/app/game/entity";
import { ResourceMetadata } from "@/app/state";

describe("resource persistence", () => {
  describe("save", () => {
    it("should store correctly", () => {
      const entity = new ResourceEntity(ResourceMetadata["catnip"]);
      entity.state.amount = 100;
      entity.state.unlocked = true;

      const stored = entity.save();

      expect(stored?.amount).to.equal(100);
      expect(stored?.unlocked).to.be.true;
    });
  });
  describe("load", () => {
    it("should load level and unlock", () => {
      const entity = new ResourceEntity(ResourceMetadata["catnip"]);

      entity.load({ amount: 100, unlocked: true });

      expect(entity.state.amount).to.equal(100);
      expect(entity.state.unlocked).to.be.true;
    });
  });
});

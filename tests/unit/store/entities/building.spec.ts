import { expect } from "chai";

import { BuildingEntity } from "@/app/game/entity";
import { BuildingMetadata } from "@/app/state";

describe("building persistence", () => {
  describe("save", () => {
    it("should store correctly", () => {
      const entity = new BuildingEntity(BuildingMetadata["catnip-field"]);
      entity.state.level = 1;
      entity.state.unlocked = true;

      const stored = entity.save();

      expect(stored?.level).to.equal(1);
      expect(stored?.unlocked).to.be.true;
    });
  });
  describe("load", () => {
    it("should load level and unlock", () => {
      const entity = new BuildingEntity(BuildingMetadata["catnip-field"]);

      entity.load({ level: 1, unlocked: true });

      expect(entity.state.level).to.equal(1);
      expect(entity.state.unlocked).to.be.true;
    });
  });
});

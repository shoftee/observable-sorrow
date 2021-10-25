import { Channel } from "@/app/presenters/common/channel";
import { expect } from "chai";

describe("channel", () => {
  describe("push", () => {
    it("should trigger handler", () => {
      let triggered = false;
      let pulled;
      const ch = new Channel<number>();
      ch.subscribe((items) => {
        triggered = true;
        pulled = Array.from(items);
      });

      ch.push([42]);
      expect(triggered).to.be.true;
      expect(pulled).to.deep.equal([42]);
    });
  });
  describe("subscribe after values", () => {
    it("should trigger handler", () => {
      const ch = new Channel<number>();
      ch.push([413]);

      let pulled;
      ch.subscribe((items) => {
        pulled = Array.from(items);
      });
      expect(pulled).to.deep.equal([413]);
    });
  });
  describe("subscribe before values", () => {
    it("should not trigger handler", () => {
      let triggered = false;
      const ch = new Channel<number>();

      ch.subscribe((_) => {
        triggered = true;
      });

      expect(triggered).to.be.false;
    });
  });
});

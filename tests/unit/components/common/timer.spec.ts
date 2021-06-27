import { expect } from "chai";
import { TimerComponent } from "@/app/ecs/common";
import { TimeConstants } from "@/app/constants";

describe("timer component", () => {
  describe("default period", () => {
    it("initializes correctly", () => {
      const timer = new TimerComponent();
      expect(timer.delta).to.equal(0);
      expect(timer.absolute).to.equal(0);
      expect(timer.period).to.equal(1);
      expect(timer.wholeTicks).to.equal(0);
    });
    describe("regular tick progression", () => {
      it("should have a delta of 1", () => {
        const timer = new TimerComponent();
        timer.update(TimeConstants.MillisecondsPerTick);
        expect(timer.delta).to.equal(1);
      });
      it("should have a tick of 1", () => {
        const timer = new TimerComponent();
        timer.update(TimeConstants.MillisecondsPerTick);
        expect(timer.absolute).to.equal(1);
      });
      it("should be marked as ticked", () => {
        const timer = new TimerComponent();
        timer.update(TimeConstants.MillisecondsPerTick);
        expect(timer.wholeTicks).to.equal(1);
      });
    });
    describe("long delta", () => {
      it("should calculate correct delta", () => {
        const timer = new TimerComponent();
        timer.update(TimeConstants.MillisecondsPerTick * 2);
        expect(timer.delta).to.equal(2);
      });
      it("should adjust tick value", () => {
        const timer = new TimerComponent();
        timer.update(TimeConstants.MillisecondsPerTick * 2);
        expect(timer.absolute).to.equal(2);
      });
      it("should be marked as ticked", () => {
        const timer = new TimerComponent();
        timer.update(TimeConstants.MillisecondsPerTick * 2);
        expect(timer.wholeTicks).to.equal(2);
      });
    });
    describe("short delta", () => {
      it("should calculate correct delta", () => {
        const timer = new TimerComponent();
        timer.update(TimeConstants.MillisecondsPerTick / 2);
        expect(timer.delta).to.equal(0.5);
        timer.update(TimeConstants.MillisecondsPerTick / 2);
        expect(timer.delta).to.equal(0.5);
      });
      it("should adjust tick value", () => {
        const timer = new TimerComponent();
        timer.update(TimeConstants.MillisecondsPerTick / 2);
        expect(timer.absolute).to.equal(0.5);
        timer.update(TimeConstants.MillisecondsPerTick / 2);
        expect(timer.absolute).to.equal(1);
      });
      it("should be marked as ticked after second delta", () => {
        const timer = new TimerComponent();
        timer.update(TimeConstants.MillisecondsPerTick / 2);
        expect(timer.wholeTicks).to.equal(0);
        timer.update(TimeConstants.MillisecondsPerTick / 2);
        expect(timer.wholeTicks).to.equal(1);
      });
    });
  });
});

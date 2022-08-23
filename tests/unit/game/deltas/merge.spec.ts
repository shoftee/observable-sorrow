import { expect } from "chai";

import { ChangeTicks, ComponentTicks } from "@/app/ecs";

import {
  addState,
  changeState,
  mergeRemovals,
  DeltaSchema,
  removeState,
} from "@/app/game/systems2/core";
import { DeltaBuffer } from "@/app/game/systems2/core/renderer";

describe("delta merge", () => {
  describe("addState", () => {
    it("should ignore symbols", () => {
      const buffer = new DeltaBuffer();
      const added = buffer.components.added;

      const newTime = {
        [ChangeTicks]: new ComponentTicks(123),
        paused: false,
        power: 1,
      };
      addState(added, { time: newTime });

      expect(added).to.deep.equal({ time: { paused: false, power: 1 } });
    });
    it("should add new objects", () => {
      const buffer = new DeltaBuffer();
      const added = buffer.components.added;

      const newTime = {
        [ChangeTicks]: new ComponentTicks(123),
        paused: false,
        power: 1,
      };
      addState(added, { time: newTime });

      expect(added).to.deep.equal({ time: { paused: false, power: 1 } });
    });
    it("should overwrite existing objects", () => {
      const buffer = new DeltaBuffer();
      const added = buffer.components.added;

      const oldTime = { paused: true, power: 1 };
      addState(added, { time: oldTime });

      const newTime = { paused: false };
      addState(added, { time: newTime });

      expect(added).to.deep.equal({ time: { paused: false, power: 1 } });
    });
    it("should add objects deeply", () => {
      const buffer = new DeltaBuffer();
      const added = buffer.components.added;

      const newResource = resource();
      addState(added, {
        resources: { catnip: newResource },
      });
      expect(added.resources?.catnip).to.not.haveOwnProperty(ChangeTicks);

      expect(added).to.deep.equal({
        resources: { catnip: newResource },
      });
    });
    it("should overwrite objects deeply", () => {
      const buffer = new DeltaBuffer();
      const added = buffer.components.added;

      const oldResource = {
        amount: 123,
        unlocked: false,
      };
      addState(added, {
        resources: { catnip: oldResource },
      });

      const newResource = resource();
      addState(added, {
        resources: { catnip: newResource },
      });

      expect(added).to.deep.equal({
        resources: { catnip: newResource },
      });
    });
    it("should accumulate", () => {
      const buffer = new DeltaBuffer();
      const added = buffer.components.added;

      const newTime = { paused: false };
      changeState(added, {
        time: newTime,
      });

      const newResource = resource();
      changeState(added, {
        resources: { catnip: newResource },
      });

      expect(added).to.deep.equal({
        time: newTime,
        resources: { catnip: newResource },
      });
    });
  });

  describe("changeState", () => {
    it("should ignore symbols", () => {
      const buffer = new DeltaBuffer();
      const changed = buffer.components.changed;

      changeState(changed, { time: { paused: false, power: 1 } });
      const newTime = {
        [ChangeTicks]: new ComponentTicks(123),
        paused: false,
        power: 1,
      };
      changeState(changed, { time: newTime });

      expect(changed).to.deep.equal({ time: { paused: false, power: 1 } });
    });
    it("should add new objects", () => {
      const buffer = new DeltaBuffer();
      const changed = buffer.components.changed;

      changeState(changed, { time: { paused: false } });

      expect(changed).to.deep.equal({ time: { paused: false } });
    });
    it("should overwrite existing objects", () => {
      const buffer = new DeltaBuffer();
      const changed = buffer.components.changed;

      changeState(changed, { time: { paused: true, power: 1 } });
      changeState(changed, { time: { paused: false } });

      expect(changed).to.deep.equal({ time: { paused: false, power: 1 } });
    });
    it("should add objects deeply", () => {
      const buffer = new DeltaBuffer();
      const changed = buffer.components.changed;

      const newResource = resource();
      changeState(changed, {
        resources: { catnip: newResource },
      });

      expect(changed).to.deep.equal({
        resources: { catnip: newResource },
      });
    });
    it("should overwrite objects deeply", () => {
      const buffer = new DeltaBuffer();
      const changed = buffer.components.changed;

      const oldResource = {
        amount: 123,
        unlocked: false,
      };
      changeState(changed, {
        resources: { catnip: oldResource },
      });

      const newResource = resource();
      changeState(changed, {
        resources: { catnip: newResource },
      });

      expect(changed).to.deep.equal({
        resources: { catnip: newResource },
      });
    });
    it("should accumulate", () => {
      const buffer = new DeltaBuffer();
      const changed = buffer.components.changed;

      changeState(changed, { time: { paused: true, power: 1 } });

      const newResource = resource();
      changeState(changed, {
        resources: { catnip: newResource },
      });

      expect(changed).to.deep.equal({
        time: { paused: true, power: 1 },
        resources: { catnip: newResource },
      });
    });
  });

  describe("removeState", () => {
    it("should remove present objects", () => {
      const newResource = resource();
      const deltas: DeltaSchema = {
        resources: {
          catnip: newResource,
        },
        time: { paused: false, power: 1 },
      };

      removeState(deltas, { time: true });

      expect(deltas).to.deep.equal({
        time: undefined,
        resources: {
          catnip: newResource,
        },
      });
    });
  });

  describe("mergeRemovals", () => {
    it("should add new objects", () => {
      const buffer = new DeltaBuffer();
      const removed = buffer.components.removed;

      mergeRemovals(removed, { time: true });

      expect(removed).to.deep.equal({ time: true });
    });
    it("should add objects deeply", () => {
      const buffer = new DeltaBuffer();
      const removed = buffer.components.removed;

      mergeRemovals(removed, {
        resources: { catnip: true },
      });

      expect(removed).to.deep.equal({
        resources: { catnip: true },
      });
    });
    it("should accumulate", () => {
      const buffer = new DeltaBuffer();
      const removed = buffer.components.removed;

      mergeRemovals(removed, { resources: { catnip: true } });
      mergeRemovals(removed, { time: true });

      expect(removed).to.deep.equal({
        resources: { catnip: true },
        time: true,
      });
    });
  });
});

function resource() {
  return { amount: 123, unlocked: true };
}

import { expect } from "chai";

import { Calendar, DeltaBuffer } from "@/app/game/systems2/types";

import {
  addState,
  changeState,
  mergeRemovals,
  DeltaSchema,
  removeState,
} from "@/app/game/systems2/core";
import { ChangeTicks } from "@/app/ecs";

describe("delta merge", () => {
  describe("addState", () => {
    it("should add new objects", () => {
      const buffer = new DeltaBuffer();
      const added = buffer.components.added;

      const newCalendar = calendar();
      addState(added, { calendar: newCalendar });

      expect(added).to.deep.equal({ calendar: newCalendar });
      expect(added.calendar).to.not.haveOwnProperty(ChangeTicks);
    });
    it("should overwrite existing objects", () => {
      const buffer = new DeltaBuffer();
      const added = buffer.components.added;

      const oldCalendar = new Calendar();
      addState(added, { calendar: oldCalendar });
      expect(added.calendar).to.not.haveOwnProperty(ChangeTicks);

      const newCalendar = calendar();
      addState(added, { calendar: newCalendar });
      expect(added.calendar).to.not.haveOwnProperty(ChangeTicks);

      expect(added).to.deep.equal({ calendar: newCalendar });
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
      expect(added.resources?.catnip).to.not.haveOwnProperty(ChangeTicks);

      const newResource = resource();
      addState(added, {
        resources: { catnip: newResource },
      });
      expect(added.resources?.catnip).to.not.haveOwnProperty(ChangeTicks);

      expect(added).to.deep.equal({
        resources: { catnip: newResource },
      });
    });
    it("should accumulate", () => {
      const buffer = new DeltaBuffer();
      const added = buffer.components.added;

      const newCalendar = new Calendar();
      changeState(added, {
        calendar: newCalendar,
      });
      expect(added.calendar).to.not.haveOwnProperty(ChangeTicks);

      const newResource = resource();
      changeState(added, {
        resources: { catnip: newResource },
      });
      expect(added.resources?.catnip).to.not.haveOwnProperty(ChangeTicks);

      expect(added).to.deep.equal({
        calendar: newCalendar,
        resources: { catnip: newResource },
      });
      expect(added.resources?.catnip).to.not.haveOwnProperty(ChangeTicks);
    });
  });

  describe("changeState", () => {
    it("should add new objects", () => {
      const buffer = new DeltaBuffer();
      const changed = buffer.components.changed;

      const newCalendar = calendar();
      changeState(changed, { calendar: newCalendar });
      expect(changed.calendar).to.not.haveOwnProperty(ChangeTicks);

      expect(changed).to.deep.equal({ calendar: newCalendar });
    });
    it("should overwrite existing objects", () => {
      const buffer = new DeltaBuffer();
      const changed = buffer.components.changed;

      const oldCalendar = new Calendar();
      changeState(changed, { calendar: oldCalendar });
      expect(changed.calendar).to.not.haveOwnProperty(ChangeTicks);

      const newCalendar = calendar();
      changeState(changed, { calendar: newCalendar });
      expect(changed.calendar).to.not.haveOwnProperty(ChangeTicks);

      expect(changed).to.deep.equal({ calendar: newCalendar });
    });
    it("should add objects deeply", () => {
      const buffer = new DeltaBuffer();
      const changed = buffer.components.changed;

      const newResource = resource();
      changeState(changed, {
        resources: { catnip: newResource },
      });
      expect(changed.resources?.catnip).to.not.haveOwnProperty(ChangeTicks);

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
      expect(changed.resources?.catnip).to.not.haveOwnProperty(ChangeTicks);

      const newResource = resource();
      changeState(changed, {
        resources: { catnip: newResource },
      });
      expect(changed.resources?.catnip).to.not.haveOwnProperty(ChangeTicks);

      expect(changed).to.deep.equal({
        resources: { catnip: newResource },
      });
    });
    it("should accumulate", () => {
      const buffer = new DeltaBuffer();
      const changed = buffer.components.changed;

      const newCalendar = new Calendar();
      changeState(changed, {
        calendar: newCalendar,
      });
      expect(changed.calendar).to.not.haveOwnProperty(ChangeTicks);

      const newResource = resource();
      changeState(changed, {
        resources: { catnip: newResource },
      });
      expect(changed.resources?.catnip).to.not.haveOwnProperty(ChangeTicks);

      expect(changed).to.deep.equal({
        calendar: newCalendar,
        resources: { catnip: newResource },
      });
    });
  });

  describe("removeState", () => {
    it("should remove present objects", () => {
      const newResource = resource();
      const newCalendar = calendar();
      const deltas: DeltaSchema = {
        calendar: newCalendar,
        resources: {
          catnip: newResource,
        },
      };

      removeState(deltas, { calendar: true });

      expect(deltas).to.deep.equal({
        calendar: undefined,
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

      mergeRemovals(removed, { calendar: true });

      expect(removed).to.deep.equal({ calendar: true });
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

      mergeRemovals(removed, {
        resources: { catnip: true },
      });

      mergeRemovals(removed, {
        calendar: true,
      });

      expect(removed).to.deep.equal({
        calendar: true,
        resources: { catnip: true },
      });
    });
  });
});

function resource() {
  return { amount: 123, unlocked: true };
}

function calendar() {
  const c = new Calendar();
  c.day = 20;
  c.season = "summer";
  c.year = 123;
  return c;
}

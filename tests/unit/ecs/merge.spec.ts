import { expect } from "chai";

import { Calendar, DeltaBuffer, Resource } from "@/app/game/systems2/types";

import {
  addState,
  changeState,
  mergeRemovals,
  DeltaSchema,
  removeState,
} from "@/app/game/systems2/core";

describe("delta merge", () => {
  describe("addState", () => {
    it("should add new objects", () => {
      const buffer = new DeltaBuffer();
      const added = buffer.components.added;

      const newCalendar = calendar();
      addState(added, { calendar: newCalendar });

      expect(added).to.deep.equal({ calendar: newCalendar });
    });
    it("should overwrite existing objects", () => {
      const buffer = new DeltaBuffer();
      const added = buffer.components.added;

      const oldCalendar = new Calendar();
      added.calendar = oldCalendar;

      const newCalendar = calendar();
      addState(added, { calendar: newCalendar });

      expect(added).to.deep.equal({ calendar: newCalendar });
    });
    it("should add objects deeply", () => {
      const buffer = new DeltaBuffer();
      const added = buffer.components.added;

      const newResource = resource();
      addState(added, {
        resources: { catnip: newResource },
      });

      expect(added).to.deep.equal({
        resources: { catnip: newResource },
      });
    });
    it("should overwrite objects deeply", () => {
      const buffer = new DeltaBuffer();
      const added = buffer.components.added;

      const oldResource = new Resource();
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

      const newCalendar = new Calendar();
      changeState(added, {
        calendar: newCalendar,
      });

      const newResource = resource();
      changeState(added, {
        resources: { catnip: newResource },
      });

      expect(added).to.deep.equal({
        calendar: newCalendar,
        resources: { catnip: newResource },
      });
    });
  });

  describe("changeState", () => {
    it("should add new objects", () => {
      const buffer = new DeltaBuffer();
      const changed = buffer.components.changed;

      const newCalendar = calendar();
      changeState(changed, { calendar: newCalendar });

      expect(changed).to.deep.equal({ calendar: newCalendar });
    });
    it("should overwrite existing objects", () => {
      const buffer = new DeltaBuffer();
      const changed = buffer.components.changed;

      const oldCalendar = new Calendar();
      changed.calendar = oldCalendar;

      const newCalendar = calendar();
      changeState(changed, { calendar: newCalendar });

      expect(changed).to.deep.equal({ calendar: newCalendar });
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

      const oldResource = new Resource();
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

      const newCalendar = new Calendar();
      changeState(changed, {
        calendar: newCalendar,
      });

      const newResource = resource();
      changeState(changed, {
        resources: { catnip: newResource },
      });

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
  const r = new Resource();
  r.amount = 123;
  return r;
}

function calendar() {
  const c = new Calendar();
  c.day = 20;
  c.season = "summer";
  c.year = 123;
  return c;
}

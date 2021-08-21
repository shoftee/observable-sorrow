import { ReactiveBag } from "@/app/core/reactive-bag";
import { expect } from "chai";

describe("reactive-bag", () => {
  describe("set", () => {
    it("should store values", () => {
      const cache = new ReactiveBag();
      cache.set("item1", 42);

      const value2 = cache.fetch("item1");
      expect(value2).to.equal(42);
    });
  });

  describe("computed", () => {
    it("should provide cached values", () => {
      const cache = new ReactiveBag();
      cache.set("value1", 42);
      cache.computed<{ value1: number }>("item1", (s) => {
        expect(s.value1).to.equal(42);
      });
    });
    it("should only call calculate once", () => {
      const cache = new ReactiveBag();
      let counter = 0;
      cache.set("value1", 42);
      cache.computed<{ value1: number }>("item1", (state) => {
        counter++;
        return state.value1 * 10;
      });

      const value1 = cache.fetch("item1");
      expect(value1).to.equal(420);

      const value2 = cache.fetch("item1");
      expect(value2).to.equal(420);

      expect(counter).to.equal(1);
    });
    it("should recalculate when dependent changes", () => {
      const cache = new ReactiveBag();
      let counter = 0;
      cache.set("value1", 42);
      cache.computed<{ value1: number }>("item1", (state) => {
        counter++;
        return state.value1 * 10;
      });

      const value1 = cache.fetch("item1");
      expect(value1).to.equal(420);

      cache.set("value1", 43);

      const value2 = cache.fetch("item1");
      expect(value2).to.equal(430);

      expect(counter).to.equal(2);
    });
    it("should recalculate with multiple levels of mixed dependencies", () => {
      const cache = new ReactiveBag();
      let counter1 = 0,
        counter2 = 0;
      cache.set("value1", 42);
      cache.set("value2", 43);
      cache.computed<{ value1: number }>("item1", (state) => {
        counter1++;
        return state.value1 * 100;
      });
      cache.computed<{ item1: number; value2: number }>("item2", (state) => {
        counter2++;
        return state.item1 + state.value2;
      });

      const item2_1 = cache.fetch("item2");
      expect(item2_1).to.equal(4243);
      expect(counter1).to.equal(1);
      expect(counter2).to.equal(1);

      cache.set("value2", 44);

      const item2_2 = cache.fetch("item2");
      expect(item2_2).to.equal(4244);
      expect(counter1).to.equal(1);
      expect(counter2).to.equal(2);

      cache.set("value1", 43);

      const item2_3 = cache.fetch("item2");
      expect(item2_3).to.equal(4344);
      expect(counter1).to.equal(2);
      expect(counter2).to.equal(3);
    });
    it("should recalculate with multiple dependencies", () => {
      const cache = new ReactiveBag();
      let counter = 0;
      cache.set("value1", 42);
      cache.set("value2", 10);
      cache.computed<{ value1: number; value2: number }>("item1", (state) => {
        counter++;
        return state.value1 * state.value2;
      });

      const item1_1 = cache.fetch("item1");
      expect(item1_1).to.equal(420);
      expect(counter).to.equal(1);

      cache.set("value1", 43);
      const item1_2 = cache.fetch("item1");
      expect(item1_2).to.equal(430);
      expect(counter).to.equal(2);

      cache.set("value2", 11);
      const item1_3 = cache.fetch("item1");
      expect(item1_3).to.equal(473);
      expect(counter).to.equal(3);

      cache.set("value1", 44);
      cache.set("value2", 12);
      const item1_4 = cache.fetch("item1");
      expect(item1_4).to.equal(528);
      expect(counter).to.equal(4);
    });
    it("should recalculate with multiple levels of recalculation", () => {
      const cache = new ReactiveBag();
      let counter1 = 0,
        counter2 = 0;
      cache.set("value1", 42);
      cache.computed<{ value1: number }>("item1", (state) => {
        counter1++;
        return state.value1 * 10;
      });
      cache.computed<{ item1: number }>("item2", (state) => {
        counter2++;
        return state.item1 * 10;
      });

      const item2_1 = cache.fetch("item2");
      expect(item2_1).to.equal(4200);
      expect(counter1).to.equal(1);
      expect(counter2).to.equal(1);

      const item1_1 = cache.fetch("item1");
      expect(item1_1).to.equal(420);
      expect(counter1).to.equal(1);
      expect(counter2).to.equal(1);

      cache.set("value1", 43);

      const item2_2 = cache.fetch("item2");
      expect(item2_2).to.equal(4300);
      expect(counter1).to.equal(2);
      expect(counter2).to.equal(2);

      const item1_2 = cache.fetch("item1");
      expect(item1_2).to.equal(430);
      expect(counter1).to.equal(2);
      expect(counter2).to.equal(2);
    });
  });
});
